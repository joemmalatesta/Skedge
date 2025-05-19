import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Alert, Animated, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";

export default function App() {
	const [recording, setRecording] = useState<Audio.Recording | null>(null);
	const [isRecording, setIsRecording] = useState(false);
	const [permission, setPermission] = useState<"undetermined" | "granted" | "denied">("undetermined");
	const scaleAnim = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		(async () => {
			const { status } = await Audio.requestPermissionsAsync();
			setPermission(status);
		})();
	}, []);

	useEffect(() => {
		if (isRecording) {
			Animated.loop(
				Animated.sequence([
					Animated.timing(scaleAnim, {
						toValue: 1.15,
						duration: 500,
						useNativeDriver: true,
					}),
					Animated.timing(scaleAnim, {
						toValue: 1,
						duration: 500,
						useNativeDriver: true,
					}),
				])
			).start();
		} else {
			scaleAnim.setValue(1);
		}
	}, [isRecording]);

	const startRecording = async () => {
		try {
			if (permission !== "granted") {
				Alert.alert("Permission required", "Please grant microphone access.");
				return;
			}
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			});
			const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
			setRecording(recording);
			setIsRecording(true);
		} catch (err) {
			console.error("Failed to start recording", err);
		}
	};

	const stopRecording = async () => {
		try {
			if (!recording) return;
			await recording.stopAndUnloadAsync();
			const uri = recording.getURI();
			console.log("Recording stopped and stored at", uri);
			setRecording(null);
			setIsRecording(false);
		} catch (err) {
			console.error("Failed to stop recording", err);
		}
	};

	const handlePress = () => {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	};

	return (
		<View style={styles.container}>
			<Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}>
				<Pressable style={styles.pressable} onPress={handlePress} android_ripple={{ color: "#222" }}>
					<Text style={styles.circleText}>{isRecording ? "Listening..." : "Tap to Chat"}</Text>
				</Pressable>
			</Animated.View>
			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	circle: {
		width: 300,
		height: 300,
		borderRadius: 150,
		backgroundColor: "#111",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 8,
	},
	pressable: {
		width: "100%",
		height: "100%",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 150,
	},
	circleText: {
		color: "#fff",
		fontSize: 28,
		fontWeight: "600",
		textAlign: "center",
	},
});
