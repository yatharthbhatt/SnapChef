import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Send, Bot, User, Sparkles, ChefHat } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useTheme } from '@/components/ThemeProvider';
import { aiService } from '@/services/aiService';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const { colors, isDarkMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Snappy, your personal AI chef 🍳 Ask me about recipes, cooking tips, or nutrition advice!",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const sendButtonScale = useSharedValue(1);

  const animatedSendStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }]
  }));

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    sendButtonScale.value = withSequence(
      withSpring(0.9),
      withSpring(1)
    );

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsTyping(true);

    try {
      // Get AI response using the AI service
      const aiResponse = await aiService.getChatResponse(currentInput);
      
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again!",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const suggestedQuestions = [
    "Quick 400-calorie dinner ideas?",
    "High-protein breakfast under 350 calories",
    "What healthy meal can I make with chicken?",
    "Low-carb recipes for weight loss"
  ];

  return (
    <LinearGradient 
      colors={isDarkMode ? ['#0a0a0b', '#1a1a2e'] : ['#f8fafc', '#e2e8f0']} 
      style={styles.container}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Bot size={32} color={colors.primary} strokeWidth={2} />
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.text }]}>Snappy</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your Personal AI Chef</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <Animated.View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.isUser ? styles.userMessageWrapper : styles.aiMessageWrapper
              ]}
            >
              <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.messageBlur}>
                <View style={[
                  styles.messageBubble,
                  message.isUser ? 
                    [styles.userMessage, { borderColor: 'rgba(99, 102, 241, 0.3)' }] : 
                    [styles.aiMessage, { borderColor: colors.border }]
                ]}>
                  <View style={styles.messageHeader}>
                    {message.isUser ? (
                      <User size={16} color="#6366f1" />
                    ) : (
                      <ChefHat size={16} color={colors.primary} />
                    )}
                    <Text style={[styles.messageTime, { color: colors.textSecondary }]}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={[styles.messageText, { color: colors.text }]}>{message.text}</Text>
                </View>
              </BlurView>
            </Animated.View>
          ))}

          {isTyping && (
            <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
              <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.messageBlur}>
                <View style={[styles.messageBubble, styles.aiMessage, { borderColor: colors.border }]}>
                  <View style={styles.typingIndicator}>
                    <Sparkles size={16} color={colors.primary} />
                    <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                      Snappy is cooking up a response...
                    </Text>
                  </View>
                </View>
              </BlurView>
            </View>
          )}
        </ScrollView>

        {messages.length === 1 && (
          <View style={styles.suggestionsContainer}>
            <Text style={[styles.suggestionsTitle, { color: colors.textSecondary }]}>Try asking:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.suggestionsRow}>
                {suggestedQuestions.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => setInputText(question)}
                  >
                    <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.chipBlur}>
                      <Text style={[styles.suggestionText, { color: colors.text }]}>{question}</Text>
                    </BlurView>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={styles.inputContainer}>
          <BlurView intensity={80} tint={isDarkMode ? "dark" : "light"} style={styles.inputBlur}>
            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="Ask about recipes, nutrition, cooking tips..."
                placeholderTextColor={colors.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
              <AnimatedTouchable
                style={[styles.sendButton, animatedSendStyle]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isTyping}
              >
                <LinearGradient
                  colors={inputText.trim() ? ['#10b981', '#059669'] : ['#374151', '#4b5563']}
                  style={styles.sendGradient}
                >
                  <Send size={20} color="white" strokeWidth={2} />
                </LinearGradient>
              </AnimatedTouchable>
            </View>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  aiMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageBlur: {
    borderRadius: 16,
  },
  messageBubble: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  userMessage: {},
  aiMessage: {},
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    lineHeight: 24,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
  },
  suggestionsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 12,
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  suggestionChip: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  chipBlur: {
    borderRadius: 20,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
    paddingTop: 16,
  },
  inputBlur: {
    borderRadius: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderWidth: 1,
    borderRadius: 24,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});