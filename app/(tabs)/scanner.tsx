import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Upload, Zap, ChefHat, Sparkles, Clock, Users, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useTheme } from '@/components/ThemeProvider';
import { aiService } from '@/services/aiService';
import { supabaseService } from '@/services/supabase/supabaseService';
import { useAuth } from '@/components/AuthProvider';
import { Logo } from '@/components/Logo';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface DetectedFood {
  name: string;
  confidence: number;
  calories: number;
  servings: number;
  cookTime: string;
  difficulty: string;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sugar: number;
  };
  description: string;
  ingredients: string[];
  instructions: string[];
}

export default function ScannerScreen() {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState<DetectedFood[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeSuggestions, setTimeSuggestions] = useState<string>('');
  const cameraRef = useRef<CameraView>(null);
  
  const scanButtonScale = useSharedValue(1);
  const uploadButtonScale = useSharedValue(1);

  const animatedScanStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scanButtonScale.value }]
  }));

  const animatedUploadStyle = useAnimatedStyle(() => ({
    transform: [{ scale: uploadButtonScale.value }]
  }));

  // Load time-based suggestions on component mount
  React.useEffect(() => {
    loadTimeSuggestions();
  }, []);

  const loadTimeSuggestions = async () => {
    try {
      const suggestions = await aiService.getTimeBasedSuggestions();
      setTimeSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading time suggestions:', error);
    }
  };

  const handleScanPress = () => {
    scanButtonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
    
    if (!permission?.granted) {
      requestPermission();
      return;
    }
    setShowCamera(true);
  };

  const handleUploadPress = () => {
    uploadButtonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
    pickImage();
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      setIsAnalyzing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          await analyzeFoodImage(photo.uri);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      } finally {
        setIsAnalyzing(false);
        setShowCamera(false);
      }
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setIsAnalyzing(true);
      await analyzeFoodImage(result.assets[0].uri);
      setIsAnalyzing(false);
    }
  };

  const analyzeFoodImage = async (imageUri: string) => {
    try {
      // Use AI service to analyze the image
      const detectedRecipes = await aiService.analyzeFoodImage(imageUri);
      
      if (detectedRecipes.length === 0) {
        Alert.alert(
          'No Food Detected', 
          'I couldn\'t identify any clear food items in this image. Please try taking a clearer photo of your ingredients.'
        );
        return;
      }
      
      setDetectedFoods(detectedRecipes);
    } catch (error) {
      console.error('Error analyzing food:', error);
      Alert.alert('Analysis Error', 'Failed to analyze the image. Please try again.');
    }
  };

  const addToFitnessTracker = (food: DetectedFood) => {
    // Save to Supabase if configured
    if (user && supabaseService.isConfigured()) {
      supabaseService.saveFitnessData(user.id, {
        type: 'food_scan',
        food_name: food.name,
        calories: food.calories,
        macros: food.macros,
        date: new Date().toISOString(),
      });
    }
    
    Alert.alert(
      'Added to Tracker!', 
      `${food.name} (${food.calories} calories) has been added to your fitness tracker.`
    );
  };

  if (showCamera) {
    return (
      <View style={styles.fullScreenCamera}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <BlurView intensity={80} tint="dark" style={styles.closeButtonBlur}>
                <X size={24} color="white" strokeWidth={2} />
              </BlurView>
            </TouchableOpacity>
            
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={styles.captureButton}
                onPress={takePicture}
                disabled={isAnalyzing}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.captureGradient}
                >
                  {isAnalyzing ? <Sparkles size={32} color="white" /> : <Camera size={32} color="white" />}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <LinearGradient 
      colors={isDarkMode ? ['#0a0a0b', '#1a1a2e'] : ['#f8fafc', '#e2e8f0']} 
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Logo size="medium" showText={true} />
          <Text style={[styles.subtitle, { color: colors.primary }]}>Eat Smart. Cook Fit. Live Better.</Text>
        </View>

        {timeSuggestions && (
          <View style={styles.suggestionsSection}>
            <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.suggestionsCard}>
              <View style={[styles.suggestionsContent, { borderColor: colors.border }]}>
                <View style={styles.suggestionsHeader}>
                  <Sparkles size={20} color={colors.primary} />
                  <Text style={[styles.suggestionsTitle, { color: colors.text }]}>Perfect Time For</Text>
                </View>
                <Text style={[styles.suggestionsText, { color: colors.textSecondary }]}>
                  {timeSuggestions}
                </Text>
              </View>
            </BlurView>
          </View>
        )}

        <View style={styles.actionContainer}>
          <AnimatedTouchable 
            style={[styles.actionButton, animatedScanStyle]}
            onPress={handleScanPress}
          >
            <BlurView intensity={80} tint={isDarkMode ? "dark" : "light"} style={styles.buttonBlur}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.8)', 'rgba(5, 150, 105, 0.8)']}
                style={styles.buttonGradient}
              >
                <Camera size={32} color="white" strokeWidth={2} />
                <Text style={styles.buttonText}>Scan Food</Text>
                <Text style={styles.buttonSubtext}>Take a photo</Text>
              </LinearGradient>
            </BlurView>
          </AnimatedTouchable>

          <AnimatedTouchable 
            style={[styles.actionButton, animatedUploadStyle]}
            onPress={handleUploadPress}
          >
            <BlurView intensity={80} tint={isDarkMode ? "dark" : "light"} style={styles.buttonBlur}>
              <LinearGradient
                colors={['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.8)']}
                style={styles.buttonGradient}
              >
                <Upload size={32} color="white" strokeWidth={2} />
                <Text style={styles.buttonText}>Upload Image</Text>
                <Text style={styles.buttonSubtext}>From gallery</Text>
              </LinearGradient>
            </BlurView>
          </AnimatedTouchable>
        </View>

        {isAnalyzing && (
          <View style={styles.analyzingContainer}>
            <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.analyzingCard}>
              <View style={[styles.analyzingContent, { borderColor: colors.border }]}>
                <Sparkles size={24} color={colors.primary} />
                <Text style={[styles.analyzingText, { color: colors.text }]}>
                  Analyzing your food...
                </Text>
              </View>
            </BlurView>
          </View>
        )}

        {detectedFoods.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsTitle, { color: colors.text }]}>Detected Recipes</Text>
            {detectedFoods.map((food, index) => (
              <Animated.View 
                key={index} 
                style={styles.foodItem}
              >
                <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.foodItemBlur}>
                  <View style={[styles.foodItemContent, { borderColor: colors.border }]}>
                    <View style={styles.foodHeader}>
                      <ChefHat size={24} color={colors.primary} />
                      <View style={styles.foodTitleContainer}>
                        <Text style={[styles.foodName, { color: colors.text }]}>{food.name}</Text>
                        <Text style={[styles.foodDescription, { color: colors.textSecondary }]}>
                          {food.description}
                        </Text>
                      </View>
                      <View style={styles.confidenceBadge}>
                        <Text style={styles.confidenceText}>{food.confidence}%</Text>
                      </View>
                    </View>
                    
                    <View style={styles.recipeDetails}>
                      <View style={styles.recipeDetailItem}>
                        <Clock size={16} color={colors.textSecondary} />
                        <Text style={[styles.recipeDetailText, { color: colors.textSecondary }]}>
                          {food.cookTime}
                        </Text>
                      </View>
                      <View style={styles.recipeDetailItem}>
                        <Users size={16} color={colors.textSecondary} />
                        <Text style={[styles.recipeDetailText, { color: colors.textSecondary }]}>
                          {food.servings} serving
                        </Text>
                      </View>
                      <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(food.difficulty) + '20' }]}>
                        <Text style={[styles.difficultyText, { color: getDifficultyColor(food.difficulty) }]}>
                          {food.difficulty}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.nutritionInfo}>
                      <View style={styles.calorieInfo}>
                        <Zap size={16} color="#f59e0b" />
                        <Text style={styles.calorieText}>{food.calories} cal</Text>
                      </View>
                    </View>
                    
                    <View style={styles.macrosGrid}>
                      <View style={[styles.macro, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Protein</Text>
                        <Text style={[styles.macroValue, { color: colors.text }]}>{food.macros.protein}g</Text>
                      </View>
                      <View style={[styles.macro, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Carbs</Text>
                        <Text style={[styles.macroValue, { color: colors.text }]}>{food.macros.carbs}g</Text>
                      </View>
                      <View style={[styles.macro, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Fats</Text>
                        <Text style={[styles.macroValue, { color: colors.text }]}>{food.macros.fats}g</Text>
                      </View>
                      <View style={[styles.macro, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Fiber</Text>
                        <Text style={[styles.macroValue, { color: colors.text }]}>{food.macros.fiber}g</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.addToTrackerButton}
                      onPress={() => addToFitnessTracker(food)}
                    >
                      <LinearGradient
                        colors={['#10b981', '#059669']}
                        style={styles.addButtonGradient}
                      >
                        <Text style={styles.addButtonText}>Add to Fitness Tracker</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
  
  function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#64748b';
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreenCamera: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    lineHeight: 24,
    marginTop: 8,
  },
  suggestionsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  suggestionsCard: {
    borderRadius: 16,
  },
  suggestionsContent: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 8,
  },
  suggestionsText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  actionContainer: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
  },
  buttonBlur: {
    flex: 1,
    borderRadius: 20,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    marginTop: 8,
  },
  buttonSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  closeButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  captureGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  analyzingCard: {
    borderRadius: 16,
  },
  analyzingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
  },
  analyzingText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 12,
  },
  resultsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  resultsTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    marginBottom: 16,
  },
  foodItem: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  foodItemBlur: {
    borderRadius: 16,
  },
  foodItemContent: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  foodName: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  foodDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  confidenceBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#10b981',
  },
  recipeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  recipeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeDetailText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  nutritionInfo: {
    marginBottom: 16,
  },
  calorieInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 12,
  },
  calorieText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#f59e0b',
    marginLeft: 6,
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  macro: {
    flex: 1,
    minWidth: '22%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  addToTrackerButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
});