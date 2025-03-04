import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Calendar, Users } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir");

    const now = new Date();
    setCurrentTime(
      now.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    );
  }, []);

  const fetchTasks = async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch("https://care-tracker-api-production.up.railway.app/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      if (storedTasks) setTasks(JSON.parse(storedTasks));
    }
    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem("tasks");
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        } else {
          await fetchTasks();
        }
      } catch (error) {
        console.error("Erreur lors du chargement des tâches", error);
      }
      setLoading(false);
    };

    loadTasks();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTasks} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, Sophie</Text>
            <Text style={styles.date}>{currentTime}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#1E293B" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Statut actuel</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>En service</Text>
            </View>
          </View>

          <View style={styles.timeInfo}>
            <Clock size={20} color="#64748B" />
            <Text style={styles.timeText}>Début: 08:30 • Fin prévue: 17:30</Text>
          </View>

          <View style={styles.statusActions}>
            <TouchableOpacity style={styles.checkInButton}>
              <Text style={styles.checkInText}>Pointer départ (NFC)</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tâches du jour</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : tasks.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tasksContainer}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                time_start={task.heure_debut}
                time_end={task.heure_fin}
                title={task.type_intervention}
                client={"Eliott"}
                address={task.adresse}
                status={task.statut}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.errorText}>Aucune tâche prévue aujourd'hui</Text>
        )}

        <Text style={styles.sectionTitle}>Tableau de bord</Text>

        <View style={styles.statsContainer}>
          <StatCard icon={<Clock size={24} color="#3B82F6" />} value={`${tasks.length}`} label="Tâches aujourd'hui" />
          <StatCard icon={<CheckCircle size={24} color="#10B981" />} value={`${tasks.filter(t => t.status === "terminé").length}`} label="Tâches complétées" />
          <StatCard icon={<AlertCircle size={24} color="#EF4444" />} value={`${tasks.filter(t => t.status === "delayed").length}`} label="Retards" />
          <StatCard icon={<Users size={24} color="#0EA5E9" />} value={`${new Set(tasks.map(t => t.client_nom)).size}`} label="Clients actifs" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TaskCard({ time_start, time_end, title, client, address, status }) {
  const getStatusColor = () => {
    switch (status) {
      case "terminé": return "#10B981";
      case "current": return "#3B82F6";
      case "planifié": return "#64748B";
      default: return "#CBD5E1";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'terminé': return 'Terminé';
      case 'en cours': return 'En cours';
      case 'planifié': return 'Planifié';
    }
  };

  return (
    <View style={styles.taskCard}>
      <View style={[styles.taskStatus, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.taskStatusText}>{getStatusText()}</Text>
      </View>
      
      <Text style={styles.taskTime}>{`${time_start.substring(0, 5)} - ${time_end.substring(0, 5)}`}</Text>
      <Text style={styles.taskTitle}>{title}</Text>
      
      <View style={styles.clientContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=50&auto=format&fit=crop' }} 
          style={styles.clientImage} 
        />
        <Text style={styles.clientName}>{client}</Text>
      </View>
      
      <Text style={styles.taskAddress}>{address}</Text>
      
      <View style={styles.taskActions}>
        <TouchableOpacity style={styles.taskButton}>
          <Text style={styles.taskButtonText}>Détails</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatCard({ icon, value, label }) {
  const getStatusColor = () => {
    switch (label) {
      case "Tâches aujourd'hui":
        return "#EFF6FF";
      case "Tâches complétées":
        return "#F0FDF4";
      case "Retards":
        return "#FEF2F2";
      case "Clients actifs":
        return "#F0F9FF";
      default:
        return "#CBD5E1";
    }
  };
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: getStatusColor() }]}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  date: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  statusBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeText: {
    color: '#64748B',
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  statusActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkInButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  checkInText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  nfcButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: 80,
    alignItems: 'center',
  },
  nfcText: {
    color: '#1E293B',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
    marginTop: 5,
    fontFamily: 'Inter-Bold',
  },
  tasksContainer: {
    paddingRight: 20,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginRight: 15,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 10,
  },
  taskStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  taskStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  taskTime: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'Inter-Regular',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
    fontFamily: 'Inter-Bold',
  },
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  clientImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  clientName: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Inter-Medium',
  },
  taskAddress: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 15,
    fontFamily: 'Inter-Regular',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  taskButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  taskButtonText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 5,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  appointmentsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  appointmentItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  appointmentDate: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  appointmentDay: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  appointmentTime: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  appointmentClient: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  errorText: { color: "red", textAlign: "center", marginTop: 20 },
  taskClient: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
});

