import React, { useEffect, useState } from "react";
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight, Clock, MapPin, Radio, Save, X } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ScheduleScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [newRemark, setNewRemark] = useState("");
  const [tasks, setTasks] = useState([]);

  const fetchPlannings = async (showAlert = false) => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        "https://care-tracker-api-production.up.railway.app/tasks",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setTasks(data);
        await AsyncStorage.setItem("tasks", JSON.stringify(data));
      } else {
        throw new Error(data.message || "Erreur serveur");
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des tâches", error);
      const storedTasks = await AsyncStorage.getItem("tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks([]);
      }
    }
    setRefreshing(false);
  };

  useEffect(() => {
    const loadPlannings = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem("tasks");
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        } else {
          await fetchPlannings(true);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des plannings", error);
      }
      setLoading(false);
    };

    loadPlannings();
  }, []);

  const updateRemark = async () => {
    if (!selectedTask) return;

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`https://care-tracker-api-production.up.railway.app/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ remarques: newRemark }),
      });

      if (!response.ok) {
        throw new Error("Échec de la mise à jour du commentaire.");
      }

      // Mettre à jour la liste des tâches localement
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTask.id ? { ...task, remarques: newRemark } : task
        )
      );

      Alert.alert("Succès", "Le commentaire a été mis à jour.");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le commentaire.");
      console.error("Erreur de mise à jour :", error);
    }

    setModalVisible(false);
  };

  const getDaysOfWeek = () => {
    const days = [];
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Commencer par lundi

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const daysOfWeek = getDaysOfWeek();

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  };

  const formatDayOfWeek = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { weekday: "short" }).charAt(0).toUpperCase();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const tasksForSelectedDate = tasks.filter((task) => {
    const taskDate = new Date(task.date);
    return (
      taskDate.getDate() === selectedDate.getDate() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Planning</Text>
      </View>

      <View style={styles.calendarHeader}>
        <Text style={styles.monthYear}>{formatMonthYear(currentDate)}</Text>
        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.navButton} onPress={goToPreviousWeek}>
            <ChevronLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={goToNextWeek}>
            <ChevronRight size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekDaysContainer}>
        {daysOfWeek.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayItem,
              isSelected(date) && styles.selectedDay,
              isToday(date) && styles.today,
            ]}
            onPress={() => selectDate(date)}
          >
            <Text style={[styles.dayOfWeek, isSelected(date) && styles.selectedDayText]}>
              {formatDayOfWeek(date)}
            </Text>
            <Text style={[styles.dayNumber, isSelected(date) && styles.selectedDayText]}>
              {date.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchPlannings(true)} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : tasksForSelectedDate.length > 0 ? (
          tasksForSelectedDate.map((task) => (
            <View key={task.id} style={styles.eventCard}>
              <View style={[styles.eventColorBar, { backgroundColor: '#3B82F6' }]} />
              <View style={styles.eventContent}>
                <View style={styles.eventTimeContainer}>
                  <Clock size={16} color="#64748B" />
                  <Text style={styles.eventTime}>
                    {task.heure_debut.substring(0, 5)} - {task.heure_fin.substring(0, 5)}
                  </Text>
                </View>

                <Text style={styles.eventTitle}>{task.type_intervention}</Text>
                {task.remarques && <Text style={styles.eventClient}>{task.remarques}</Text>}

                <View style={styles.eventLocationContainer}>
                  <MapPin size={16} color="#64748B" />
                  <Text style={styles.eventLocation}>Intervention planifiée</Text>
                </View>

                <View style={styles.eventActions}>
                <TouchableOpacity
                  style={styles.eventButton}
                  onPress={() => {
                    setSelectedTask(task);
                    setSelectedRemark(task.remarques || "Aucune remarque disponible");
                    setNewRemark(task.remarques);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.eventButtonText}>Détails</Text>
                </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.errorText}>Aucune tâche prévue pour ce jour</Text>
        )}
      </ScrollView>

      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Modifier le commentaire</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              placeholder="Saisir un commentaire..."
              value={newRemark}
              onChangeText={setNewRemark}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={updateRemark} style={styles.saveButton}>
                <Save size={20} color="#FFF" />
                <Text style={styles.modalButtonText}>Enregistrer</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
                <X size={20} color="#FFF" />
                <Text style={styles.modalButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  navigationButtons: {
    flexDirection: "row",
  },
  dayItem: {
    width: 40,
    height: 70,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 5,
  },
  selectedDay: {
    backgroundColor: "#3B82F6",
  },
  selectedDayText: {
    color: "#FFFFFF",
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    color: "red",
  },
  eventLocation: {
    color: '#64748B',
    marginLeft: 5,
    fontSize: 14,
    flex: 1,
    fontFamily: 'Inter-Regular',
  },
  eventLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  eventContent: {
    flex: 1,
    padding: 15,
  },
  eventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventTime: {
    color: '#64748B',
    marginLeft: 5,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 5,
    fontFamily: 'Inter-Bold',
  },
  eventClient: {
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 10,
    fontFamily: 'Inter-Medium',
  },
  today: {
    backgroundColor: '#10B981',
  },
  dayOfWeek: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 5,
    fontFamily: 'Inter-Medium',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  eventColorBar: {
    width: 6,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  eventButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  eventButtonText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  checkInButton: {
    backgroundColor: '#3B82F6',
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  modalBackground: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { backgroundColor: "#FFF", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 16, color: "#374151", textAlign: "center", marginBottom: 15 },
  modalCloseButton: { flexDirection: "row", backgroundColor: "#3B82F6", padding: 10, borderRadius: 5, alignItems: "center" },
  modalCloseText: { color: "#FFF", marginLeft: 5 },
  modalInput: { width: "100%", borderWidth: 1, borderColor: "#E5E7EB", padding: 10, borderRadius: 5, minHeight: 80, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 10 },
  saveButton: { flexDirection: "row", backgroundColor: "#10B981", padding: 10, borderRadius: 5, alignItems: "center" },
  modalButtonText: { color: "#FFF", marginLeft: 5 },
});

