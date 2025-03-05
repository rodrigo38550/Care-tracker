import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TextInput, Button, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CreditCard as Edit, Clock, CircleCheck as CheckCircle, MapPin, Phone, Mail, Calendar, LogOut } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const availabilityData = [
    { day: "Lundi", slots: ["available", "available", "unavailable"] },
    { day: "Mardi", slots: ["available", "available", "available"] },
    { day: "Mercredi", slots: ["unavailable", "unavailable", "unavailable"] },
    { day: "Jeudi", slots: ["available", "available", "unavailable"] },
    { day: "Vendredi", slots: ["available", "available", "unavailable"] },
  ];
  const [editedUser, setEditedUser] = useState({
    nom: "",
    prenom: "",
    tel: "",
    num_voie: "",
    type_voie: "",
    nom_voie: "",
    ville: "",
    code_postal: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          const token = await AsyncStorage.getItem("token");
          if (!token) {
            router.replace("/auth/login");
            return;
          }

          const response = await fetch("https://care-tracker-api-production.up.railway.app/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await response.json();
          if (response.ok) {
            setUser(data);
            await AsyncStorage.setItem("user", JSON.stringify(data));
          } else {
            console.error("Erreur API:", data.message);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          const adresseParts = parsedUser.adresse?.split(" ") || ["", "", "", "", ""];
          setEditedUser({
            nom: parsedUser.nom || "",
            prenom: parsedUser.prenom || "",
            tel: parsedUser.tel || "",
            num_voie: adresseParts[0] || "",
            type_voie: adresseParts[1] || "",
            nom_voie: adresseParts[2] || "",
            ville: adresseParts[3] || "",
            code_postal: adresseParts[4] || "",
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);
  
  const saveProfileChanges = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté.");
        return;
      }

      const updatedUser = {
        nom: editedUser.nom || user.nom,
        prenom: editedUser.prenom || user.prenom,
        tel: editedUser.tel || user.tel,
        num_voie: editedUser.num_voie || user.num_voie,
        type_voie: editedUser.type_voie || user.type_voie,
        nom_voie: editedUser.nom_voie || user.nom_voie,
        ville: editedUser.ville || user.ville,
        code_postal: editedUser.code_postal || user.code_postal,
      };

      const response = await fetch("https://care-tracker-api-production.up.railway.app/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(updatedUser);
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        setModalVisible(false);
        Alert.alert("Succès", "Profil mis à jour avec succès.");
      } else {
        Alert.alert("Erreur", data.message || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le profil.");
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    router.replace("/auth/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : user ? (
          <>
            <View style={styles.header}>
              <View style={styles.profileImageContainer}>
                <Image source={{ uri: user.profilePicture || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" }} style={styles.profileImage} />
                <TouchableOpacity style={styles.editButton}>
                  <Edit size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.userName}>{user.nom} {user.prenom}</Text>
              <Text style={styles.userRole}>{user.role}</Text>

            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informations personnelles</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoItem}>
                  <Phone size={20} color="#64748B" style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Téléphone</Text>
                    <Text style={styles.infoValue}>{user.tel}</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <Mail size={20} color="#64748B" style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user.email}</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <MapPin size={20} color="#64748B" style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Adresse</Text>
                    <Text style={styles.infoValue}>{user.num_voie} {user.type_voie} {user.nom_voie} {user.ville} {user.code_postal}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.editProfileButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.editProfileText}>Modifier le profil</Text>
              </TouchableOpacity>

            </View>


            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <LogOut size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Déconnexion</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.errorText}>Impossible de charger le profil</Text>
        )}
      </ScrollView>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            <TextInput style={styles.input} placeholder="Nom" value={editedUser.nom} onChangeText={(text) => setEditedUser({ ...editedUser, nom: text })} />
            <TextInput style={styles.input} placeholder="Prénom" value={editedUser.prenom} onChangeText={(text) => setEditedUser({ ...editedUser, prenom: text })} />
            <TextInput style={styles.input} placeholder="Téléphone" value={editedUser.tel} onChangeText={(text) => setEditedUser({ ...editedUser, tel: text })} />
            <TextInput style={styles.input} placeholder="Numéro de voie" value={editedUser.num_voie} onChangeText={(text) => setEditedUser({ ...editedUser, num_voie: text })} />
            <TextInput style={styles.input} placeholder="Type de voie (Rue, Avenue...)" value={editedUser.type_voie} onChangeText={(text) => setEditedUser({ ...editedUser, type_voie: text })} />
            <TextInput style={styles.input} placeholder="Nom de la voie" value={editedUser.nom_voie} onChangeText={(text) => setEditedUser({ ...editedUser, nom_voie: text })} />
            <TextInput style={styles.input} placeholder="Ville" value={editedUser.ville} onChangeText={(text) => setEditedUser({ ...editedUser, ville: text })} />
            <TextInput style={styles.input} placeholder="Code postal" value={editedUser.code_postal} onChangeText={(text) => setEditedUser({ ...editedUser, code_postal: text })} />

            <Button title="Enregistrer" onPress={saveProfileChanges} />
            <Button title="Annuler" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 20 },
  header: { alignItems: "center", marginBottom: 30, marginTop: 10 },
  profileImageContainer: { position: "relative", marginBottom: 15 },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: "#FFFFFF" },
  editButton: {
    position: "absolute", bottom: 0, right: 0, backgroundColor: "#3B82F6",
    width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#FFFFFF",
  },
  userName: { fontSize: 24, fontWeight: "bold", color: "#1E293B", marginBottom: 5 },
  userRole: { fontSize: 16, color: "#64748B", marginBottom: 20 },
  userStats: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 15, width: "100%" },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: "#E2E8F0" },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#1E293B", marginTop: 5, marginBottom: 2 },
  statLabel: { fontSize: 12, color: "#64748B" },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1E293B", marginBottom: 15 },
  infoCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 15, marginBottom: 15 },
  infoItem: { flexDirection: "row", marginBottom: 15 },
  infoIcon: { marginRight: 15, marginTop: 2 },
  infoLabel: { fontSize: 14, color: "#64748B", marginBottom: 2 },
  infoValue: { fontSize: 16, color: "#1E293B" },
  logoutButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: "#FEF2F2", borderRadius: 10, paddingVertical: 12, marginBottom: 30 },
  logoutText: { color: "#EF4444", fontSize: 16, fontWeight: "600", marginLeft: 10 },
  errorText: { color: "red", textAlign: "center", marginTop: 20 },
  editProfileButton: { backgroundColor: '#F1F5F9', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  editProfileText: { color: '#1E293B', fontSize: 16, fontWeight: '600', fontFamily: 'Inter-SemiBold' },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  skillItem: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    marginBottom: 10,
  },
  skillText: {
    color: '#3B82F6',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  certificationsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  certIcon: {
    marginRight: 10,
  },
  certificationText: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    fontFamily: 'Inter-Regular',
  },
  availabilityContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 15,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayName: {
    width: 80,
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Inter-Medium',
  },
  timeSlots: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeSlot: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  availableSlot: {
    backgroundColor: '#F0FDF4',
  },
  unavailableSlot: {
    backgroundColor: '#FEF2F2',
  },
  timeSlotText: {
    fontSize: 12,
    color: '#1E293B',
    fontFamily: 'Inter-Regular',
  },
  editAvailabilityButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editAvailabilityText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

