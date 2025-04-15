import React, { useState, useRef } from 'react';
import { Alert, Text, StyleSheet, View, TextInput, Keyboard, TouchableWithoutFeedback, TouchableOpacity, KeyboardAvoidingView, ScrollView, SafeAreaView, Platform, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { useAuth } from '../../auth/AuthProvider';
import { authFetch } from '../../../utils/authFetch'; 
import { SettingsStackScreenProps } from '../../types/navigation';
import { useNavigation } from 'expo-router';

const AddProviderScreen = () => {
    const navigation = useNavigation<SettingsStackScreenProps<'AddProvider'>['navigation']>();
    const inputRefs = useRef<Array<TextInput | null>>([]);
    const [code, setCode] = useState<string[]>(new Array(8).fill(''));
    const {accessToken, refreshAccessToken, logout} = useAuth();

    const handleAddRelationship = async () => {
    if (code.includes('')) {
        Alert.alert('Error', 'Please enter a valid Provider ID in the format XXXX-XXXX');
        return;
    }
    const providerID = `${code.slice(0, 4).join('')}-${code.slice(4, 8).join('')}`;
    try {
        const response = await authFetch(
            `${process.env.EXPO_PUBLIC_DEV_SERVER_URL}/add-relationship/`,
            accessToken, refreshAccessToken, logout, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ shareable_id: providerID }),
            }
        );

        const data = await response.json();
        console.log();
        if (response.ok) {
            if (data.message.includes("already exists")) {
                Alert.alert('Notice', 'This relationship already exists.');
            } else {
                Alert.alert('Success', data.message);
                navigation.goBack();
            }
        } else {
        Alert.alert('Error', data.error || 'Failed to add relationship');
        }
    } catch (error) {
        Alert.alert('Error', 'Something went wrong');
        console.error(error);
        }
    };

    const handleInputChange = (text: string, index: number) => {
        const newCode = [...code];
        if (/^[a-zA-Z0-9]$/.test(text)) {
          newCode[index] = text.toUpperCase();
          setCode(newCode);
    
          if (index < 7) {
            inputRefs.current[index + 1]?.focus();
          }
        } else if (text === '') {
          newCode[index] = '';
          setCode(newCode);
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
          const newCode = [...code];
          newCode[index - 1] = '';
          setCode(newCode);
          inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.mainContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 60}
        >
            <ScrollView>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <SafeAreaView>
                        <View style={styles.container}>
                            <View style={styles.inputContainer}>
                                <View style={styles.inputGroup}>
                                {code.map((char, index) => (
                                    <React.Fragment key={index}>
                                    <TextInput
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        style={styles.input}
                                        value={char}
                                        onChangeText={(text) => handleInputChange(text, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        maxLength={1}
                                        keyboardType="default"
                                        autoCapitalize="characters"
                                        autoComplete="off"
                                        autoCorrect={false}
                                        returnKeyType="next"
                                    />
                                    {index === 3 && <Text style={styles.hyphen}>-</Text>}
                                    </React.Fragment>
                                ))}
                                </View>
                                <TouchableOpacity style={styles.reportButton} onPress={handleAddRelationship}>
                                <Text style={styles.reportButtonText}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>
                                Your medical provider will be able to track your dry weight progess.
                                </Text>
                            </View>
                        </View>
                    </SafeAreaView>
                </TouchableWithoutFeedback>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#FFF9FF',
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#FFF9FF',
        paddingHorizontal: 20,
        paddingVertical: 30,
    },
    inputContainer: {
        alignItems: 'center',
    },
    input: {
        height: 60,
        width: "9.5%",
        borderColor: '#0E315F',
        borderWidth: 2,
        borderRadius: 8,
        padding: 4,
        backgroundColor: '#fff',
        textAlign: 'center',
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        marginHorizontal: 3,
        marginBottom: 15,
    },
    inputGroup: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hyphen: {
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 5,
        color: '#0E315F',
    },
      reportButton: {
        backgroundColor: '#7B5CB8',
        padding: 12,
        borderRadius: 8,
        width: '90%',
        alignItems: 'center',
    },
    reportButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#7A7A7A',
        textAlign: 'center',
    },
});

export default AddProviderScreen;