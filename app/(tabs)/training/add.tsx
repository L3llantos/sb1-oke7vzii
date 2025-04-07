import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ScrollView } from 'react-native-gesture-handler';

const ACTIVITY_TYPES = [
  'Running',
  'Walking',
  'Cycling',
  'Swimming',
  'Weight Training',
  'Yoga',
  'HIIT',
  'Other'
];

export default function AddActivity() {
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!activityType || !duration) {
      setError('Please fill in activity type and duration');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not found');
      }

      const { error: insertError } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          duration_minutes: parseInt(duration),
          calories_burned: calories ? parseInt(calories) : null,
          notes: notes.trim() || null
        });

      if (insertError) throw insertError;

      // Refresh the activities list by navigating back
      router.replace('/training/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add activity');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Activity</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        <Text style={styles.label}>Activity Type</Text>
        <View style={styles.activityTypes}>
          {ACTIVITY_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.activityTypeButton,
                activityType === type && styles.activityTypeButtonSelected
              ]}
              onPress={() => setActivityType(type)}>
              <Text
                style={[
                  styles.activityTypeText,
                  activityType === type && styles.activityTypeTextSelected
                ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          placeholder="Enter duration"
          placeholderTextColor="#71717a"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Calories Burned (optional)</Text>
        <TextInput
          style={styles.input}
          value={calories}
          onChangeText={setCalories}
          placeholder="Enter calories"
          placeholderTextColor="#71717a"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes about your activity"
          placeholderTextColor="#71717a"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Adding...' : 'Add Activity'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b1e',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  input: {
    backgroundColor: '#2d2e32',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  errorContainer: {
    backgroundColor: '#ef4444',
    margin: 20,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  activityTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  activityTypeButton: {
    backgroundColor: '#2d2e32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  activityTypeButtonSelected: {
    backgroundColor: '#6366f1',
  },
  activityTypeText: {
    color: '#a1a1aa',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  activityTypeTextSelected: {
    color: '#fff',
  },
});