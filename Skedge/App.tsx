import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Alert, Animated, Pressable, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import Voice from "@react-native-voice/voice";

export default function App() {
	const [isRecording, setIsRecording] = useState(false);
	const [transcript, setTranscript] = useState("");
	const scaleAnim = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		Voice.onSpeechResults = (e) => {
			if (e.value && e.value.length > 0) {
				setTranscript(e.value[0]);
			}
		};
		Voice.onSpeechError = (e) => {
			Alert.alert("Speech Error", JSON.stringify(e.error));
			setIsRecording(false);
		};
		return () => {
			Voice.destroy().then(Voice.removeAllListeners);
		};
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

	const startListening = async () => {
		try {
			setTranscript("");
			await Voice.start(Platform.OS === "ios" ? "en-US" : "en-US");
			setIsRecording(true);
		} catch (e) {
			let message = "Unknown error";
			if (e instanceof Error) message = e.message;
			else if (typeof e === "string") message = e;
			Alert.alert("Could not start speech recognition", message);
		}
	};

	const stopListening = async () => {
		try {
			await Voice.stop();
			setIsRecording(false);
		} catch (e) {
			let message = "Unknown error";
			if (e instanceof Error) message = e.message;
			else if (typeof e === "string") message = e;
			Alert.alert("Could not stop speech recognition", message);
		}
	};

	const handlePress = () => {
		if (isRecording) {
			stopListening();
		} else {
			startListening();
		}
	};

	return (
		<View style={styles.container}>
			<Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}>
				<Pressable style={styles.pressable} onPress={handlePress} android_ripple={{ color: "#222" }}>
					<Text style={styles.circleText}>{isRecording ? "Listening..." : "Tap to Chat"}</Text>
				</Pressable>
			</Animated.View>
			<Text style={styles.transcript}>{transcript}</Text>
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
	transcript: {
		marginTop: 40,
		fontSize: 22,
		color: "#222",
		textAlign: "center",
		paddingHorizontal: 20,
	},
});
