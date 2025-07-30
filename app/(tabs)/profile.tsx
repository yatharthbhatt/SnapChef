import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { User, Mail, Phone, BookOpen, Moon, Sun, Camera, Settings, Heart, Trophy } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface SavedRecipe {
  id: string;
  name: string;
  cookTime: string;
  difficulty: string;
  calories: number;
}

export default function ProfileScreen() {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { user, signOut } = useAuth();
  const [userProfile] = useState({
    name: user?.name || 'SnapChef User',
    email: user?.email || 'user@snapchef.com',
    phone: '+1 (555) 123-4567',
    profileImage: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    joinDate: 'March 2024',
    recipesCooked: 47,
    favoriteIngredients: ['Avocado', 'Quinoa', 'Salmon', 'Spinach'],
  });

  const [savedRecipes] = useState<SavedRecipe[]>([
    { id: '1', name: 'Mediterranean Bowl', cookTime: '25 min', difficulty: 'Easy', calories: 420 },
    { id: '2', name: 'Protein Smoothie', cookTime: '5 min', difficulty: 'Easy', calories: 280 },
    { id: '3', name: 'Garlic Herb Pasta', cookTime: '15 min', difficulty: 'Medium', calories: 380 },
    { id: '4', name: 'Quinoa Salad', cookTime: '20 min', difficulty: 'Easy', calories: 320 },
  ]);

  const editButtonScale = useSharedValue(1);
  const cameraButtonScale = useSharedValue(1);

  const animatedEditStyle = useAnimatedStyle(() => ({
    transform: [{ scale: editButtonScale.value }]
  }));

  const animatedCameraStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cameraButtonScale.value }]
  }));

  const handleEditProfile = () => {
    editButtonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
  };

  const handleChangePhoto = () => {
    cameraButtonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <LinearGradient 
      colors={isDarkMode ? ['#0a0a0b', '#1a1a2e'] : ['#f8fafc', '#e2e8f0']} 
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.profileCard}>
            <View style={[styles.profileContent, { borderColor: colors.border }]}>
              <View style={styles.profileImageContainer}>
                <Image source={{ uri: userProfile.profileImage }} style={styles.profileImage} />
                <AnimatedTouchable 
                  style={[styles.cameraButton, animatedCameraStyle]}
                  onPress={handleChangePhoto}
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.cameraGradient}
                  >
                    <Camera size={16} color="white" strokeWidth={2} />
                  </LinearGradient>
                </AnimatedTouchable>
              </View>

              <View style={styles.profileInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{userProfile.name}</Text>
                <Text style={[styles.userJoinDate, { color: colors.textSecondary }]}>
                  Member since {userProfile.joinDate}
                </Text>
                
                <View style={styles.contactInfo}>
                  <View style={styles.contactRow}>
                    <Mail size={16} color={colors.textSecondary} />
                    <Text style={[styles.contactText, { color: colors.text }]}>{userProfile.email}</Text>
                  </View>
                  <View style={styles.contactRow}>
                    <Phone size={16} color={colors.textSecondary} />
                    <Text style={[styles.contactText, { color: colors.text }]}>{userProfile.phone}</Text>
                  </View>
                </View>

              
              <TouchableOpacity 
                style={styles.signOutButton}
                onPress={handleSignOut}
              >
                <Text style={[styles.signOutText, { color: '#ef4444' }]}>Sign Out</Text>
              </TouchableOpacity>
                <AnimatedTouchable 
                  style={[styles.editButton, animatedEditStyle]}
                  onPress={handleEditProfile}
                >
                  <BlurView intensity={40} tint={isDarkMode ? "dark" : "light"} style={styles.editButtonBlur}>
                    <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit Profile</Text>
                  </BlurView>
                </AnimatedTouchable>
              </View>
            </View>
          </BlurView>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.statCard}>
              <View style={[styles.statContent, { borderColor: colors.border }]}>
                <Trophy size={24} color="#f59e0b" />
                <Text style={[styles.statValue, { color: colors.text }]}>{userProfile.recipesCooked}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Recipes Cooked</Text>
              </View>
            </BlurView>
            
            <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.statCard}>
              <View style={[styles.statContent, { borderColor: colors.border }]}>
                <Heart size={24} color="#ef4444" />
                <Text style={[styles.statValue, { color: colors.text }]}>{savedRecipes.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved Recipes</Text>
              </View>
            </BlurView>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.settingsCard}>
            <View style={[styles.settingsContent, { borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  {isDarkMode ? (
                    <Moon size={20} color="#10b981" />
                  ) : (
                    <Sun size={20} color="#f59e0b" />
                  )}
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                  thumbColor={isDarkMode ? '#ffffff' : '#374151'}
                />
              </View>
            </View>
          </BlurView>
        </View>

        <View style={styles.favoritesSection}>
          <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.favoritesCard}>
            <View style={[styles.favoritesContent, { borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Favorite Ingredients</Text>
              <View style={styles.ingredientsGrid}>
                {userProfile.favoriteIngredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientChip}>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>
          </BlurView>
        </View>

        <View style={styles.recipesSection}>
          <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.recipesCard}>
            <View style={[styles.recipesContent, { borderColor: colors.border }]}>
              <View style={styles.recipesHeader}>
                <BookOpen size={24} color="#8b5cf6" />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Saved Recipes</Text>
              </View>
              
              {savedRecipes.map((recipe) => (
                <View key={recipe.id} style={[styles.recipeItem, { borderBottomColor: colors.border }]}>
                  <View style={styles.recipeInfo}>
                    <Text style={[styles.recipeName, { color: colors.text }]}>{recipe.name}</Text>
                    <View style={styles.recipeDetails}>
                      <Text style={[styles.recipeTime, { color: colors.textSecondary }]}>{recipe.cookTime}</Text>
                      <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(recipe.difficulty) + '20' }]}>
                        <Text style={[styles.difficultyText, { color: getDifficultyColor(recipe.difficulty) }]}>
                          {recipe.difficulty}
                        </Text>
                      </View>
                      <Text style={[styles.recipeCalories, { color: colors.textSecondary }]}>{recipe.calories} cal</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.recipeAction}>
                    <Heart size={16} color="#ef4444" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: 20,
  },
  profileContent: {
    padding: 24,
    borderWidth: 1,
    borderRadius: 20,
  },
  profileImageContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#10b981',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cameraGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  userJoinDate: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginBottom: 20,
  },
  contactInfo: {
    gap: 8,
    marginBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  editButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  editButtonBlur: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  statsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
  },
  statContent: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: 4,
  },
  settingsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  settingsCard: {
    borderRadius: 16,
  },
  settingsContent: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  favoritesSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  favoritesCard: {
    borderRadius: 16,
  },
  favoritesContent: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ingredientText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#10b981',
  },
  recipesSection: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  recipesCard: {
    borderRadius: 16,
  },
  recipesContent: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
  },
  recipesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  recipeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  recipeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recipeTime: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  recipeCalories: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  recipeAction: {
    padding: 8,
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 16,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});