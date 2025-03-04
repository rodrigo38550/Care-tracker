import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WifiOff, Radio } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NfcManager, { NfcTech } from "react-native-nfc-manager";

export default function TasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const fetchTasks = async (showAlert = false) => {
    setRefreshing(true);
    setOfflineMode(false);
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
      setOfflineMode(true);

      if (showAlert) {
        Alert.alert(
          "Mode hors-ligne",
          "Impossible de récupérer les dernières tâches. Utilisation des données stockées."
        );
      }

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
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem("tasks");
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        } else {
          await fetchTasks(true);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des tâches", error);
      }
      setLoading(false);
    };

    loadTasks();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR"); // Format DD/MM/YYYY
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case "terminé":
        return "#10B981"; // Vert
      case "en cours":
        return "#3B82F6"; // Bleu
      case "planifié":
        return "#64748B"; // Gris
      default:
        return "#E5E7EB"; // Gris clair
    }
  };

  const getStatusText = (statut) => {
    switch (statut) {
      case "terminé":
        return "Terminé";
      case "en cours":
        return "En cours";
      case "planifié":
        return "À venir";
      default:
        return "Inconnu";
    }
  };

  const handleNfcScan = async (taskId) => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      console.log("NFC Tag détecté:", tag);

      Alert.alert("Pointage NFC réussi", "La tâche a été marquée comme complétée.");
    } catch (error) {
      Alert.alert("Échec du scan NFC", "Impossible de valider la tâche via NFC.");
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes tâches</Text>
        {offlineMode && (
          <View style={styles.offlineBanner}>
            <WifiOff size={16} color="#EF4444" />
            <Text style={styles.offlineText}>Mode hors-ligne</Text>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchTasks(true)} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTime}>
                  {formatDate(task.date)} {task.heure_debut} - {task.heure_fin}
                </Text>
                <View
                  style={[
                    styles.taskStatus,
                    { backgroundColor: getStatusColor(task.statut) },
                  ]}
                >
                  <Text style={styles.taskStatusText}>{getStatusText(task.statut)}</Text>
                </View>
              </View>
              <Text style={styles.taskTitle}>{task.type_intervention}</Text>

              {task.remarques && <Text style={styles.taskRemarks}>{task.remarques}</Text>}

              <View style={styles.taskActions}>
                <TouchableOpacity style={styles.nfcButton} onPress={() => handleNfcScan(task.id)}>
                  <Radio size={16} color="#FFF" />
                  <Text style={styles.nfcButtonText}>Scan NFC</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.errorText}>Aucune tâche disponible</Text>
        )}
      </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 5,
    borderRadius: 5,
  },
  offlineText: {
    color: "#EF4444",
    marginLeft: 5,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  taskTime: {
    color: "#64748B",
    fontSize: 14,
  },
  taskStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  taskStatusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  taskRemarks: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 10,
  },
  taskActions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  nfcButton: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  nfcButtonText: {
    color: "#FFF",
    marginLeft: 5,
  },
  errorText: { color: "red", textAlign: "center", marginTop: 20 },
});
