import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Alert, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WifiOff, Radio, Save, X } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NfcManager, { NfcTech } from "react-native-nfc-manager";

export default function TasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [newRemark, setNewRemark] = useState("");
  const [scanning, setScanning] = useState(false);
  const [modalVisibleNFC, setModalVisibleNFC] = useState(false);

  const handleNfcScan = async (taskId) => {
    setModalVisibleNFC(true); // Ouvre le modal d'attente NFC
    setScanning(true);


    try {
      const isSupported = await NfcManager.isSupported();
      console.log("NFC supporté:", isSupported);
    
      if (!isSupported) {
        Alert.alert("NFC non supporté", "Votre appareil ne supporte pas la lecture NFC.");
        setModalVisibleNFC(false);
        return;
      }
    
      await NfcManager.requestTechnology(NfcTech.Ndef);
      console.log("Technologie NFC activée");
    } catch (error) {
      console.error("Erreur lors de l'activation de la technologie NFC:", error);
      Alert.alert("Erreur NFC", `Impossible d'activer la technologie NFC. ${error.message}`);
    } finally {
      setScanning(false);
      setModalVisibleNFC(false);
    }
    
    try {
      // Vérifie si NFC est activé
      const isEnabled = await NfcManager.isEnabled();
      if (!isEnabled) {
        Alert.alert("NFC désactivé", "Veuillez activer le NFC dans les paramètres.");
        setModalVisibleNFC(false);
        return;
      }

      // Demande l'accès au NFC
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Définition du timeout pour arrêter après 10 secondes
      const timeout = setTimeout(() => {
        setScanning(false);
        setModalVisibleNFC(false);
        NfcManager.cancelTechnologyRequest();
        Alert.alert("Temps écoulé", "Aucune carte NFC détectée.");
      }, 10000); // 10 secondes

      // Écoute un scan NFC
      const tag = await NfcManager.getTag();
      clearTimeout(timeout); // Annule le timeout si un tag est détecté

      console.log("NFC Tag détecté:", tag);
      Alert.alert("Scan réussi", "Carte NFC détectée !");
    } catch (error) {
      Alert.alert("Erreur NFC", `Impossible de scanner la carte. ${error}`);
    } finally {
      setScanning(false);
      setModalVisibleNFC(false);
      NfcManager.cancelTechnologyRequest();
    }
  };

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
                  {formatDate(task.date)} {task.heure_debut.substring(0, 5)} - {task.heure_fin.substring(0, 5)}
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
          ))
        ) : (
          <Text style={styles.errorText}>Aucune tâche disponible</Text>
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

      <Modal transparent={true} visible={modalVisibleNFC} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Approchez une carte NFC</Text>
            {scanning ? <ActivityIndicator size="large" color="#3B82F6" /> : null}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setScanning(false);
                setModalVisible(false);
                NfcManager.cancelTechnologyRequest();
              }}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
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
  modalBackground: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { backgroundColor: "#FFF", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 16, color: "#374151", textAlign: "center", marginBottom: 15 },
  modalCloseButton: { flexDirection: "row", backgroundColor: "#3B82F6", padding: 10, borderRadius: 5, alignItems: "center" },
  modalCloseText: { color: "#FFF", marginLeft: 5 },
  errorText: { color: "red", textAlign: "center", marginTop: 20 },
  modalInput: { width: "100%", borderWidth: 1, borderColor: "#E5E7EB", padding: 10, borderRadius: 5, minHeight: 80, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 10 },
  saveButton: { flexDirection: "row", backgroundColor: "#10B981", padding: 10, borderRadius: 5, alignItems: "center" },
  modalButtonText: { color: "#FFF", marginLeft: 5 },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#EF4444",
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "#FFF",
  },
});
