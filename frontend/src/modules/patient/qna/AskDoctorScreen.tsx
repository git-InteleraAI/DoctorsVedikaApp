/**
 * frontend/src/modules/patient/qna/AskDoctorScreen.tsx
 * Premium Ask a Doctor Dashboard & Creation interface.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../core/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getPatientQuestions, submitQuestion } from '../../../features/qna/api';
import { selectAndUploadReport } from '../../../features/qna/uploadReport';
import { getTopDoctors } from '../../../features/doctor-discovery/api';
import { useAppNavigation } from '../../../navigation/navigationHelpers';
import { PrimaryButton } from '../../../core/components/PrimaryButton';
import type { PatientStackParamList } from '../../../app/navigation/PatientNavigator';
import type { QuestionWithDoctor } from '../../../features/qna/types';
import type { DoctorsRow } from '../../../types/database';

type RoutePropType = RouteProp<PatientStackParamList, 'AskDoctor'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function AskDoctorScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RoutePropType>();
  const { profile } = useAuth();

  const preselectedDoctorId = route.params?.preselectedDoctorId;
  const preselectedDoctorName = route.params?.preselectedDoctorName;

  const [activeTab, setActiveTab] = useState<'pending' | 'answered'>('pending');
  const [questions, setQuestions] = useState<QuestionWithDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [doctorList, setDoctorList] = useState<DoctorsRow[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [questionText, setQuestionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [isUploadingReport, setIsUploadingReport] = useState(false);

  async function loadQuestions(silent = false) {
    if (!profile?.id) return;
    if (!silent) setIsLoading(true);

    try {
      const data = await getPatientQuestions(profile.id);
      setQuestions(data);
    } catch (err: any) {
      console.error('[Questions] Load error:', err);
      Alert.alert('Error', 'Unable to retrieve your questions.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function loadActiveDoctors() {
    const data = await getTopDoctors(20);
    setDoctorList(data);
    if (data.length > 0 && !preselectedDoctorId) {
      setSelectedDoctorId(data[0].doctor_id);
    }
  }

  useEffect(() => {
    loadQuestions();
    loadActiveDoctors();

    if (preselectedDoctorId) {
      setSelectedDoctorId(preselectedDoctorId);
      setShowModal(true);
    }
  }, [preselectedDoctorId]);

  async function handleSubmitQuestion() {
    if (!profile?.id) {
      Alert.alert('Authentication required', 'Please sign in to ask a doctor.');
      return;
    }
    if (!selectedDoctorId) {
      Alert.alert('Selection required', 'Please select a doctor for your query.');
      return;
    }
    if (!questionText.trim()) {
      Alert.alert('Question required', 'Please type your health question.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitQuestion({
        patient_id: profile.id,
        doctor_id: selectedDoctorId,
        question_text: questionText,
        report_url: reportUrl,
      });

      setIsSubmitting(false);
      Alert.alert('Question Submitted', 'Your question and medical report have been sent to the doctor.');
      setQuestionText('');
      setReportUrl(null);
      setShowModal(false);
      loadQuestions(true);
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Submission Failed', err.message);
    }
  }

  const filteredQuestions = questions.filter((q) => q.status === activeTab);

  const getSelectedDoctorName = () => {
    if (preselectedDoctorId && preselectedDoctorName) return `Dr. ${preselectedDoctorName}`;
    const doc = doctorList.find((d) => d.doctor_id === selectedDoctorId);
    return doc ? `Dr. ${doc.doctor_name} (${doc.doctor_specialization ?? 'Specialist'})` : 'Select Doctor';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="#0F2537" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ask a Doctor</Text>
        <TouchableOpacity style={styles.newQuestionBtn} onPress={() => setShowModal(true)}>
          <Feather name="plus" size={22} color="#00A8B5" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Awaiting Response
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'answered' && styles.tabActive]}
          onPress={() => setActiveTab('answered')}
        >
          <Text style={[styles.tabText, activeTab === 'answered' && styles.tabTextActive]}>
            Answered Queries
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00A8B5" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredQuestions}
          keyExtractor={(item) => item.id}
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            loadQuestions(true);
          }}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + theme.spacing.lg },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <MaterialCommunityIcons
                name={activeTab === 'pending' ? 'message-question' : 'message-reply-text'}
                size={70}
                color="#CBD5E1"
              />
              <Text style={styles.emptyTitle}>
                {activeTab === 'pending' ? 'No pending questions' : 'No answers yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'pending'
                  ? 'Have a medical concern? Ask a verified doctor right away.'
                  : 'Answers will show up here as soon as the doctor responds.'}
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={() => setShowModal(true)}
              >
                <Text style={styles.emptyActionText}>Ask a Question</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const dateStr = new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <View style={styles.questionCard}>
                <View style={styles.doctorHeaderRow}>
                  {item.doctors?.doctor_profile_photo ? (
                    <Image
                      source={{ uri: item.doctors.doctor_profile_photo }}
                      style={styles.docAvatar}
                    />
                  ) : (
                    <View style={styles.docAvatarFallback}>
                      <Text style={styles.docAvatarFallbackText}>
                        {item.doctors?.doctor_name.charAt(0) || 'D'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.docMetaCol}>
                    <Text style={styles.docCardName}>Dr. {item.doctors?.doctor_name || 'Verified Doctor'}</Text>
                    <Text style={styles.docCardSpec}>
                      {item.doctors?.doctor_qualification || 'MBBS, MD'}  •  {item.doctors?.doctor_specialization || 'Physician'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, activeTab === 'answered' ? styles.badgeGreen : styles.badgeYellow]}>
                    <Text style={[styles.badgeText, activeTab === 'answered' ? styles.badgeTextGreen : styles.badgeTextYellow]}>
                      {activeTab === 'answered' ? 'Answered' : 'Pending'}
                    </Text>
                  </View>
                </View>

                <View style={styles.questionSection}>
                  <Text style={styles.sectionLabel}>Your Question:</Text>
                  <Text style={styles.questionText}>{item.question_text}</Text>
                  <Text style={styles.timestampText}>Posted on {dateStr}</Text>
                </View>

                {activeTab === 'answered' && item.answer_text ? (
                  <View style={styles.answerSection}>
                    <View style={styles.answerHeader}>
                      <MaterialCommunityIcons name="shield-check" size={16} color="#00A8B5" />
                      <Text style={styles.answerTitle}>Doctor's Advice:</Text>
                    </View>
                    <Text style={styles.answerText}>{item.answer_text}</Text>
                    {item.answered_at ? (
                      <Text style={styles.answeredTime}>
                        Replied on {new Date(item.answered_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ask a Doctor</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Choose Doctor</Text>
              
              <TouchableOpacity
                style={[styles.pickerTrigger, preselectedDoctorId && styles.pickerTriggerDisabled]}
                onPress={() => !preselectedDoctorId && setShowDocPicker(!showDocPicker)}
                disabled={!!preselectedDoctorId}
              >
                <Text style={styles.pickerTriggerText}>{getSelectedDoctorName()}</Text>
                {!preselectedDoctorId && (
                  <Feather name={showDocPicker ? 'chevron-up' : 'chevron-down'} size={20} color="#64748B" />
                )}
              </TouchableOpacity>

              {showDocPicker && (
                <View style={styles.pickerDropdown}>
                  <FlatList
                    data={doctorList}
                    keyExtractor={(d) => d.doctor_id}
                    style={{ maxHeight: 150 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.pickerDropdownItem}
                        onPress={() => {
                          setSelectedDoctorId(item.doctor_id);
                          setShowDocPicker(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          Dr. {item.doctor_name} ({item.doctor_specialization ?? 'General Specialist'})
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}

              <Text style={[styles.modalLabel, { marginTop: theme.spacing.md }]}>Your Medical Question</Text>
              <TextInput
                style={styles.questionInput}
                placeholder="Describe your health symptoms or questions in detail..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
                value={questionText}
                onChangeText={setQuestionText}
                textAlignVertical="top"
              />

              <View style={{ marginTop: 12 }}>
                <Text style={styles.modalLabel}>Attach Medical Report / Prescription</Text>
                {reportUrl ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#86EFAC', borderRadius: 8, padding: 10, justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Feather name="check-circle" size={18} color="#16A34A" />
                      <Text style={{ fontSize: 12, color: '#15803D', fontWeight: '600' }}>Report Attached Successfully</Text>
                    </View>
                    <TouchableOpacity onPress={() => setReportUrl(null)}>
                      <Feather name="trash-2" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#F0FDFA',
                      borderWidth: 1,
                      borderColor: '#99F6E4',
                      borderStyle: 'dashed',
                      borderRadius: 8,
                      padding: 12,
                      gap: 8,
                    }}
                    onPress={async () => {
                      if (!profile?.id) return;
                      setIsUploadingReport(true);
                      const url = await selectAndUploadReport(profile.id);
                      setIsUploadingReport(false);
                      if (url) {
                        setReportUrl(url);
                      }
                    }}
                  >
                    {isUploadingReport ? (
                      <ActivityIndicator size="small" color="#0F766E" />
                    ) : (
                      <>
                        <Feather name="paperclip" size={16} color="#0F766E" />
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#0F766E' }}>Upload Prescription / Lab Report</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.inputHint}>
                Doctor answers are for guidance only and do not replace an in-person emergency clinical examination.
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmitQuestion}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Post Question</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2537',
  },
  newQuestionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#00A8B5',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: theme.spacing.md,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: theme.spacing.lg,
  },
  emptyActionBtn: {
    backgroundColor: '#00A8B5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...theme.shadow.card,
  },
  doctorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  docAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  docAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00A8B5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  docAvatarFallbackText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  docMetaCol: {
    flex: 1,
  },
  docCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  docCardSpec: {
    fontSize: 11,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeYellow: {
    backgroundColor: '#FFF9C4',
  },
  badgeGreen: {
    backgroundColor: '#E0F2F1',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextYellow: {
    color: '#FBC02D',
  },
  badgeTextGreen: {
    color: '#00A8B5',
  },
  questionSection: {
    marginBottom: theme.spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  questionText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    fontWeight: '500',
  },
  timestampText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
  },
  answerSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  answerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  answerText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
  },
  answeredTime: {
    fontSize: 10,
    color: '#166534',
    opacity: 0.8,
    marginTop: 6,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 37, 55, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2537',
  },
  modalBody: {
    paddingVertical: theme.spacing.lg,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerTriggerDisabled: {
    backgroundColor: '#E2E8F0',
  },
  pickerTriggerText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
  },
  pickerDropdown: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  pickerDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  questionInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#1E293B',
    minHeight: 120,
  },
  inputHint: {
    fontSize: 10,
    color: '#F43F5E',
    marginTop: 8,
    lineHeight: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  submitBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#00A8B5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
