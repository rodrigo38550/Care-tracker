import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Moon, Lock, Languages, CircleHelp as HelpCircle, FileText, Shield, ChevronRight, Smartphone, Wifi } from "lucide-react-native";
//import { themeEventEmitter } from "../../lib/eventEmitter";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const systemTheme = useColorScheme(); // Détecte le thème système
  const [darkMode, setDarkMode] = useState(systemTheme === "dark");
  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [nfcEnabled, setNfcEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      const storedTheme = await AsyncStorage.getItem("theme");
      if (storedTheme !== null) setDarkMode(storedTheme === "dark");

      const storedOfflineMode = await AsyncStorage.getItem("offlineMode");
      if (storedOfflineMode !== null) setOfflineMode(storedOfflineMode === "true");

      const storedNfc = await AsyncStorage.getItem("nfcEnabled");
      if (storedNfc !== null) setNfcEnabled(storedNfc === "true");
    };

    loadPreferences();
  }, []);

  const toggleDarkMode = async () => {
    const newTheme = darkMode ? "light" : "dark";
    setDarkMode(!darkMode);
    await AsyncStorage.setItem("theme", newTheme);
    //themeEventEmitter.emit("themeChanged", newTheme);
  };

  const toggleOfflineMode = async () => {
    const newMode = !offlineMode;
    setOfflineMode(newMode);
    await AsyncStorage.setItem("offlineMode", newMode.toString());
  };

  const toggleNfc = async () => {
    const newNfc = !nfcEnabled;
    setNfcEnabled(newNfc);
    await AsyncStorage.setItem("nfcEnabled", newNfc.toString());
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={styles.title}>Paramètres</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Application</Text>

        <View style={[styles.settingsCard, darkMode && styles.darkCard]}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={22} color={darkMode ? "#FACC15" : "#3B82F6"} style={styles.settingIcon} />
              <Text style={[styles.settingText, darkMode && styles.darkText]}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#CBD5E1", true: "#BFDBFE" }}
              thumbColor={notifications ? "#3B82F6" : "#F1F5F9"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Moon size={22} color={darkMode ? "#FACC15" : "#8B5CF6"} style={styles.settingIcon} />
              <Text style={[styles.settingText, darkMode && styles.darkText]}>Mode sombre</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#CBD5E1", true: "#DDD6FE" }}
              thumbColor={darkMode ? "#FACC15" : "#F1F5F9"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Languages size={22} color="#10B981" style={styles.settingIcon} />
              <Text style={[styles.settingText, darkMode && styles.darkText]}>Langue</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={[styles.settingText, darkMode && styles.darkText]}>Français</Text>
              <ChevronRight size={18} color="#64748B" />
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Confidentialité et sécurité</Text>

        <View style={[styles.settingsCard, darkMode && styles.darkCard]}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Lock size={22} color="#EF4444" style={styles.settingIcon} />
              <Text style={[styles.settingText, darkMode && styles.darkText]}>Changer le mot de passe</Text>
            </View>
            <ChevronRight size={18} color={darkMode ? "#CBD5E1" : "#64748B"} />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Shield size={22} color="#F59E0B" style={styles.settingIcon} />
              <Text style={[styles.settingText, darkMode && styles.darkText]}>Confidentialité</Text>
            </View>
            <ChevronRight size={18} color={darkMode ? "#CBD5E1" : "#64748B"} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Fonctionnalités</Text>

        <View style={[styles.settingsCard, darkMode && styles.darkCard]}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Wifi size={22} color="#0EA5E9" style={styles.settingIcon} />
              <View>
                <Text style={[styles.settingText, darkMode && styles.darkText]}>Mode hors ligne</Text>
              </View>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={toggleOfflineMode}
              trackColor={{ false: "#CBD5E1", true: "#BAE6FD" }}
              thumbColor={offlineMode ? "#0EA5E9" : "#F1F5F9"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Smartphone size={22} color="#8B5CF6" style={styles.settingIcon} />
              <View>
                <Text style={[styles.settingText, darkMode && styles.darkText]}>Pointage NFC</Text>
              </View>
            </View>
            <Switch
              value={nfcEnabled}
              onValueChange={toggleNfc}
              trackColor={{ false: "#CBD5E1", true: "#DDD6FE" }}
              thumbColor={nfcEnabled ? "#8B5CF6" : "#F1F5F9"}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>À propos</Text>
        
        <View style={[styles.settingsCard, darkMode && styles.darkCard]}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <HelpCircle size={22} color="#F59E0B" style={styles.settingIcon} />
              <Text style={[styles.settingText, darkMode && styles.darkText]}>Support et assistance</Text>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <FileText size={22} color="#10B981" style={styles.settingIcon} />
              <Text style={[styles.settingText, darkMode && styles.darkText]}>Conditions générales</Text>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: 20, alignItems: 'center'},
  title: { fontSize: 20, fontWeight: 'bold', color: '#1F2937'},
  darkTitle: { color: "#F8FAFC" },
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingHorizontal: 16 },
  darkContainer: { backgroundColor: "#1E293B" },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#4B5563", marginVertical: 10 },
  darkText: { color: "#F8FAFC" },
  settingsCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 10, marginBottom: 15,  shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3},
  darkCard: { backgroundColor: "#334155" },
  settingItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB'},
  settingInfo: { flexDirection: "row", alignItems: "center" },
  settingIcon: { marginRight: 10 },
  settingText: { fontSize: 16, color: "#374151" },
  settingValue: { flexDirection: 'row', alignItems: 'center'},
  settingValueText: { fontSize: 16, color: '#64748B', marginRight: 8,
  },
});

