import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Mail, ArrowLeft } from "lucide-react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleResetPassword = () => {
    if (!email) {
      setError("Veuillez entrer votre adresse email");
      return;
    }
    setError(null);
    setSuccess(true);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-5">
        
        {/* Bouton retour */}
        <TouchableOpacity className="mt-10 mb-5 w-10 h-10 justify-center items-center" onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>

        {/* Contenu principal */}
        <View className="bg-white p-5 rounded-2xl shadow-lg">
          <Text className="text-2xl font-bold text-gray-900 text-center">Mot de passe oublié</Text>

          {!success ? (
            <>
              <Text className="text-gray-600 text-center mt-2">Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</Text>

              {error && <Text className="text-red-500 text-center mt-2">{error}</Text>}

              {/* Champ Email */}
              <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-4 py-3 mt-4">
                <Mail size={20} color="#64748B" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Bouton Réinitialisation */}
              <TouchableOpacity className="bg-blue-500 rounded-lg py-3 mt-5 items-center" onPress={handleResetPassword}>
                <Text className="text-white font-semibold text-lg">Réinitialiser le mot de passe</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="items-center mt-5">
              <Text className="text-green-500 text-center text-lg">
                Un email a été envoyé à {email} avec les instructions pour réinitialiser votre mot de passe.
              </Text>

              <TouchableOpacity className="bg-blue-500 rounded-lg py-3 px-5 mt-5" onPress={() => router.replace("/auth/login")}>
                <Text className="text-white font-semibold text-lg">Retour à la connexion</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
