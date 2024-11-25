import { View, Text, TextInput,Button, ScrollView, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { useLanguage } from '../services/LanguageProvider';

const SurveyScreen = () => {
  const { language, switchLanguage, i18n } = useLanguage();


    // Get questions based on user's selected language (using i18n)
  const questions = i18n.t('questions');

  // State to track answers
  const [answers, setAnswers] = useState(new Array(questions.length).fill(''));

  // Handle text input change
  const handleAnswerChange = (index, text) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = text;
    setAnswers(updatedAnswers);
  };

  // Handle submission of the survey
  const handleSubmit = () => {
    console.log('Survey Answers:', answers);
    // Submit answers to a server or store them locally
    // For now, just log them
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{i18n.t('surveyTitle')}</Text>
      {questions.map((question, index) => (
        <View key={index} style={styles.questionContainer}>
          <Text style={styles.question}>{question}</Text>
          <TextInput
            style={styles.input}
            value={answers[index]}
            onChangeText={(text) => handleAnswerChange(index, text)}
            placeholder={i18n.t('inputPlaceholder')}
          />
        </View>
      ))}
      <Button title={i18n.t('submit_survey')} onPress={handleSubmit} color="#6200EE" />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
    container: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    questionContainer: {
      marginBottom: 15,
    },
    question: {
      fontSize: 16,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      height: 40,
    },
  });  

export default SurveyScreen