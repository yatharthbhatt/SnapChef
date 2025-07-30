import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Activity, Droplets, Footprints, Zap, Plus, TrendingUp } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useTheme } from '@/components/ThemeProvider';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface FitnessData {
  calories: number;
  steps: number;
  water: number;
  protein: number;
  carbs: number;
  fats: number;
  date: string;
}

export default function FitnessScreen() {
  const { colors, isDarkMode } = useTheme();
  const [todayData, setTodayData] = useState<FitnessData>({
    calories: 0,
    steps: 0,
    water: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    date: new Date().toDateString(),
  });
  
  const [inputs, setInputs] = useState({
    calories: '',
    steps: '',
    water: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  const saveButtonScale = useSharedValue(1);

  const animatedSaveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }]
  }));

  const handleSave = () => {
    saveButtonScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );

    const newData = {
      calories: parseInt(inputs.calories) || 0,
      steps: parseInt(inputs.steps) || 0,
      water: parseFloat(inputs.water) || 0,
      protein: parseFloat(inputs.protein) || 0,
      carbs: parseFloat(inputs.carbs) || 0,
      fats: parseFloat(inputs.fats) || 0,
      date: new Date().toDateString(),
    };

    setTodayData(prev => ({
      ...prev,
      calories: prev.calories + newData.calories,
      steps: prev.steps + newData.steps,
      water: prev.water + newData.water,
      protein: prev.protein + newData.protein,
      carbs: prev.carbs + newData.carbs,
      fats: prev.fats + newData.fats,
    }));

    setInputs({ calories: '', steps: '', water: '', protein: '', carbs: '', fats: '' });
  };

  const StatCard = ({ icon, title, value, unit, color, progress }: {
    icon: React.ReactNode;
    title: string;
    value: number;
    unit: string;
    color: string;
    progress?: number;
  }) => (
    <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.statCard}>
      <View style={[styles.statCardContent, { borderColor: color + '40' }]}>
        <View style={styles.statHeader}>
          {icon}
          <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
        </View>
        <Text style={[styles.statValue, { color: colors.text }]}>{value.toLocaleString()}</Text>
        <Text style={[styles.statUnit, { color: colors.textSecondary }]}>{unit}</Text>
        {progress && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { backgroundColor: color, width: `${Math.min(progress, 100)}%` }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {Math.round(progress)}%
            </Text>
          </View>
        )}
      </View>
    </BlurView>
  );

  const goals = {
    calories: 2000,
    steps: 10000,
    water: 2.5,
    protein: 150,
    carbs: 250,
    fats: 65,
  };

  return (
    <LinearGradient 
      colors={isDarkMode ? ['#0a0a0b', '#1a1a2e'] : ['#f8fafc', '#e2e8f0']} 
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Fitness Tracker</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Track your daily progress</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon={<Zap size={24} color="#f59e0b" />}
            title="Calories"
            value={todayData.calories}
            unit="kcal"
            color="#f59e0b"
            progress={(todayData.calories / goals.calories) * 100}
          />
          <StatCard
            icon={<Footprints size={24} color="#10b981" />}
            title="Steps"
            value={todayData.steps}
            unit="steps"
            color="#10b981"
            progress={(todayData.steps / goals.steps) * 100}
          />
          <StatCard
            icon={<Droplets size={24} color="#06b6d4" />}
            title="Water"
            value={todayData.water}
            unit="liters"
            color="#06b6d4"
            progress={(todayData.water / goals.water) * 100}
          />
          <StatCard
            icon={<Zap size={24} color="#8b5cf6" />}
            title="Protein"
            value={todayData.protein}
            unit="grams"
            color="#8b5cf6"
            progress={(todayData.protein / goals.protein) * 100}
          />
          <StatCard
            icon={<Zap size={24} color="#f97316" />}
            title="Carbs"
            value={todayData.carbs}
            unit="grams"
            color="#f97316"
            progress={(todayData.carbs / goals.carbs) * 100}
          />
          <StatCard
            icon={<Zap size={24} color="#ef4444" />}
            title="Fats"
            value={todayData.fats}
            unit="grams"
            color="#ef4444"
            progress={(todayData.fats / goals.fats) * 100}
          />
        </View>

        <View style={styles.inputSection}>
          <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.inputContainer}>
            <View style={[styles.inputContent, { borderColor: colors.border }]}>
              <Text style={[styles.inputTitle, { color: colors.text }]}>Add Today's Data</Text>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Calories Consumed</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                  <Zap size={20} color="#f59e0b" />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Enter calories"
                    placeholderTextColor={colors.textSecondary}
                    value={inputs.calories}
                    onChangeText={(text) => setInputs(prev => ({ ...prev, calories: text }))}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>kcal</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Steps Walked</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                  <Footprints size={20} color="#10b981" />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Enter steps"
                    placeholderTextColor={colors.textSecondary}
                    value={inputs.steps}
                    onChangeText={(text) => setInputs(prev => ({ ...prev, steps: text }))}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>steps</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Water Intake</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                  <Droplets size={20} color="#06b6d4" />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Enter water"
                    placeholderTextColor={colors.textSecondary}
                    value={inputs.water}
                    onChangeText={(text) => setInputs(prev => ({ ...prev, water: text }))}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>L</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Protein Intake</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                  <Zap size={20} color="#8b5cf6" />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Enter protein"
                    placeholderTextColor={colors.textSecondary}
                    value={inputs.protein}
                    onChangeText={(text) => setInputs(prev => ({ ...prev, protein: text }))}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>g</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Carbs Intake</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                  <Zap size={20} color="#f97316" />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Enter carbs"
                    placeholderTextColor={colors.textSecondary}
                    value={inputs.carbs}
                    onChangeText={(text) => setInputs(prev => ({ ...prev, carbs: text }))}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>g</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Fats Intake</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                  <Zap size={20} color="#ef4444" />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="Enter fats"
                    placeholderTextColor={colors.textSecondary}
                    value={inputs.fats}
                    onChangeText={(text) => setInputs(prev => ({ ...prev, fats: text }))}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>g</Text>
                </View>
              </View>

              <AnimatedTouchable 
                style={[styles.saveButton, animatedSaveStyle]}
                onPress={handleSave}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.saveGradient}
                >
                  <Plus size={20} color="white" strokeWidth={2} />
                  <Text style={styles.saveButtonText}>Add to Today</Text>
                </LinearGradient>
              </AnimatedTouchable>
            </View>
          </BlurView>
        </View>

        <View style={styles.trendsSection}>
          <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.trendsContainer}>
            <View style={[styles.trendsContent, { borderColor: colors.border }]}>
              <View style={styles.trendsHeader}>
                <TrendingUp size={24} color="#8b5cf6" />
                <Text style={[styles.trendsTitle, { color: colors.text }]}>Weekly Summary</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Avg. Daily Calories</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>1,850 kcal</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Avg. Daily Steps</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>8,420 steps</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Avg. Daily Water</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>2.1 L</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Avg. Daily Protein</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>125 g</Text>
              </View>
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
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    lineHeight: 24,
  },
  statsGrid: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    borderRadius: 16,
  },
  statCardContent: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  inputSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  inputContainer: {
    borderRadius: 16,
  },
  inputContent: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
  },
  inputTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginLeft: 12,
  },
  inputUnit: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  saveButton: {
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
  trendsSection: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  trendsContainer: {
    borderRadius: 16,
  },
  trendsContent: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
  },
  trendsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});