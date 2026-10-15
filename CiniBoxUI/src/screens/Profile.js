import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { baseURL } from "../constants/constants";

const PROFILE_URL = `${baseURL}/profile`;
const PROFILE_PICTURE_URL = `${baseURL}/profile/picture`;
const MAX_PICTURE_BYTES = 5 * 1024 * 1024;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Reads the API's { success, message, data } envelope and throws the server's message on failure.
async function readApiResponse(response, fallbackMessage) {
  let result = null;

  try {
    result = await response.json();
  } catch {
    // Non-JSON bodies (e.g. a 413 from the server) fall through to the fallback message.
  }

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || fallbackMessage);
  }

  return result.data;
}

async function requestProfile() {
  const response = await fetch(PROFILE_URL);
  return readApiResponse(response, "Unable to load profile");
}

function toForm(profile) {
  return {
    name: profile.name || "",
    userName: profile.userName || "",
    email: profile.email || "",
    phoneNumber: profile.phoneNumber || "",
    bio: profile.bio || "",
    dateOfBirth: profile.dateOfBirth || "",
    country: profile.country || "",
  };
}

function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

// Formats "YYYY-MM-DD" without going through Date, which would shift the day across time zones.
function formatDate(value) {
  if (!value || !isValidDate(value)) return "Not set";
  const [year, month, day] = value.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

// Mirrors the server-side rules in ProfileService so most mistakes are caught before saving.
function validateForm(form) {
  if (!form.name.trim()) return "Name is required.";
  if (!form.userName.trim()) return "Username is required.";
  if (!form.email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Email is not valid.";

  const dateOfBirth = form.dateOfBirth.trim();
  if (dateOfBirth) {
    if (!isValidDate(dateOfBirth)) return "Date of birth must be a valid date (YYYY-MM-DD).";
    if (dateOfBirth > todayString()) return "Date of birth cannot be in the future.";
  }

  return "";
}

function getInitials(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const [message, setMessage] = useState(null);

  // Bumped by "Try Again" to re-run the load effect.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    requestProfile()
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setLoadError("");
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || "Something went wrong");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retryLoad = () => {
    setLoading(true);
    setLoadError("");
    setReloadKey((key) => key + 1);
  };

  const startEditing = () => {
    setForm(toForm(profile));
    setMessage(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setForm(null);
    setMessage(null);
  };

  const updateField = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    const validationError = validateForm(form);
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const body = {
        ...profile,
        name: form.name.trim(),
        userName: form.userName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        bio: form.bio.trim() || null,
        dateOfBirth: form.dateOfBirth.trim() || null,
        country: form.country.trim(),
      };

      const response = await fetch(PROFILE_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await readApiResponse(response, "Unable to update profile");
      setProfile(data);
      setEditing(false);
      setForm(null);
      setMessage({ type: "success", text: "Profile updated." });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Unable to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const pickProfilePicture = async () => {
    if (uploadingPicture) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];

      if (asset.fileSize && asset.fileSize > MAX_PICTURE_BYTES) {
        setMessage({ type: "error", text: "Profile picture must be 5 MB or smaller." });
        return;
      }

      setUploadingPicture(true);
      setMessage(null);

      const fileName = asset.fileName || "profile.jpg";
      const formData = new FormData();

      if (Platform.OS === "web") {
        const blob = await (await fetch(asset.uri)).blob();
        formData.append("file", blob, fileName);
      } else {
        formData.append("file", {
          uri: asset.uri,
          name: fileName,
          type: asset.mimeType || "image/jpeg",
        });
      }

      // Content-Type is left unset so fetch adds the multipart boundary itself.
      const response = await fetch(PROFILE_PICTURE_URL, {
        method: "PUT",
        body: formData,
      });

      const data = await readApiResponse(response, "Unable to update profile picture");
      setProfile(data);
      setMessage({ type: "success", text: "Profile picture updated." });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Unable to update profile picture" });
    } finally {
      setUploadingPicture(false);
    }
  };

  const removeProfilePicture = async () => {
    if (uploadingPicture) return;

    try {
      setUploadingPicture(true);
      setMessage(null);

      const response = await fetch(PROFILE_PICTURE_URL, { method: "DELETE" });
      const data = await readApiResponse(response, "Unable to remove profile picture");
      setProfile(data);
      setMessage({ type: "success", text: "Profile picture removed." });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Unable to remove profile picture" });
    } finally {
      setUploadingPicture(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#F43F5E" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (loadError || !profile) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.errorText}>{loadError || "Profile not available"}</Text>

        <Pressable style={styles.primaryButton} onPress={retryLoad}>
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const pictureUri = profile.profilePicture ? `${baseURL}/${profile.profilePicture}` : null;

  const renderMessage = () =>
    message && (
      <View
        style={[
          styles.messageBox,
          message.type === "error" ? styles.messageError : styles.messageSuccess,
        ]}
      >
        <Ionicons
          name={message.type === "error" ? "alert-circle" : "checkmark-circle"}
          size={18}
          color={message.type === "error" ? "#FCA5A5" : "#86EFAC"}
        />
        <Text
          style={[
            styles.messageText,
            { color: message.type === "error" ? "#FCA5A5" : "#86EFAC" },
          ]}
        >
          {message.text}
        </Text>
      </View>
    );

  const renderInfoRow = (icon, label, value) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color="#FB7185" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "Not set"}</Text>
      </View>
    </View>
  );

  const renderField = (label, field, inputProps = {}) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, inputProps.multiline && styles.inputMultiline]}
        value={form[field]}
        onChangeText={updateField(field)}
        placeholderTextColor="#656B79"
        selectionColor="#F43F5E"
        editable={!saving}
        {...inputProps}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#090B10" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Profile</Text>
              <Text style={styles.subtitle}>
                {editing ? "EDIT YOUR DETAILS" : "YOUR CINIBOX IDENTITY"}
              </Text>
            </View>

            {!editing && (
              <Pressable style={styles.editButton} onPress={startEditing}>
                <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
            )}
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Pressable
              onPress={pickProfilePicture}
              disabled={uploadingPicture}
              accessibilityRole="button"
              accessibilityLabel="Change profile picture"
            >
              <View style={styles.avatarRing}>
                {pictureUri ? (
                  <Image source={{ uri: pictureUri }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarInitials}>{getInitials(profile.name)}</Text>
                  </View>
                )}

                {uploadingPicture && (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator color="#FFFFFF" />
                  </View>
                )}
              </View>

              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            </Pressable>

            {pictureUri && !uploadingPicture && (
              <Pressable onPress={removeProfilePicture} hitSlop={8}>
                <Text style={styles.removePhoto}>Remove photo</Text>
              </Pressable>
            )}

            {!editing && (
              <>
                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.userName}>@{profile.userName}</Text>
                {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
              </>
            )}
          </View>

          {renderMessage()}

          {editing ? (
            <View style={styles.card}>
              {renderField("Name", "name", { placeholder: "Your name" })}
              {renderField("Username", "userName", {
                placeholder: "username",
                autoCapitalize: "none",
                autoCorrect: false,
              })}
              {renderField("Email", "email", {
                placeholder: "you@example.com",
                keyboardType: "email-address",
                autoCapitalize: "none",
                autoCorrect: false,
              })}
              {renderField("Phone", "phoneNumber", {
                placeholder: "Phone number",
                keyboardType: "phone-pad",
              })}
              {renderField("Bio", "bio", {
                placeholder: "Tell us about your taste in movies",
                multiline: true,
                maxLength: 250,
              })}
              {renderField("Date of birth", "dateOfBirth", {
                placeholder: "YYYY-MM-DD",
                keyboardType: Platform.OS === "web" ? "default" : "numbers-and-punctuation",
                maxLength: 10,
              })}
              {renderField("Country", "country", { placeholder: "Country" })}

              <View style={styles.formActions}>
                <Pressable
                  style={[styles.secondaryButton, saving && styles.buttonDisabled]}
                  onPress={cancelEditing}
                  disabled={saving}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[styles.primaryButton, styles.saveButton, saving && styles.buttonDisabled]}
                  onPress={saveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Save Changes</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              {renderInfoRow("mail-outline", "EMAIL", profile.email)}
              {renderInfoRow("call-outline", "PHONE", profile.phoneNumber)}
              {renderInfoRow("calendar-outline", "DATE OF BIRTH", formatDate(profile.dateOfBirth))}
              {renderInfoRow("globe-outline", "COUNTRY", profile.country)}
            </View>
          )}

          <Text style={styles.footer}>Made for the love of cinema 🎬</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090B10",
  },

  center: {
    flex: 1,
    backgroundColor: "#090B10",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    padding: 20,
  },

  scrollContent: {
    paddingBottom: 25,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
  },

  subtitle: {
    color: "#858A99",
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 5,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#191C25",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  avatarSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  avatarRing: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 3,
    borderColor: "#E11D48",
    padding: 3,
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 59,
    backgroundColor: "#191C25",
  },

  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },

  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
  },

  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    margin: 3,
    borderRadius: 59,
    backgroundColor: "rgba(9,11,16,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },

  cameraBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E11D48",
    borderWidth: 3,
    borderColor: "#090B10",
    alignItems: "center",
    justifyContent: "center",
  },

  removePhoto: {
    color: "#FB7185",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 16,
    textAlign: "center",
  },

  userName: {
    color: "#FB7185",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },

  bio: {
    color: "#D1D5DB",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    textAlign: "center",
  },

  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },

  messageError: {
    backgroundColor: "rgba(127,29,29,0.25)",
    borderColor: "rgba(252,165,165,0.3)",
  },

  messageSuccess: {
    backgroundColor: "rgba(20,83,45,0.25)",
    borderColor: "rgba(134,239,172,0.3)",
  },

  messageText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },

  card: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#12151D",
    gap: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#191C25",
    alignItems: "center",
    justifyContent: "center",
  },

  infoLabel: {
    color: "#858A99",
    fontSize: 9,
    letterSpacing: 1.3,
  },

  infoValue: {
    color: "#F3F4F6",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },

  field: {
    gap: 8,
  },

  fieldLabel: {
    color: "#858A99",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  input: {
    color: "#FFFFFF",
    fontSize: 15,
    backgroundColor: "#191C25",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  inputMultiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  formActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },

  primaryButton: {
    backgroundColor: "#E11D48",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButton: {
    flex: 1,
  },

  secondaryButton: {
    backgroundColor: "#191C25",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  loadingText: {
    color: "#9CA3AF",
  },

  errorText: {
    color: "#FCA5A5",
    textAlign: "center",
  },

  footer: {
    color: "#656B79",
    textAlign: "center",
    paddingVertical: 20,
    fontSize: 12,
  },
});
