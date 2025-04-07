import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Skill {
  name: string;
  level: number;
  color: string;
}

const defaultSkills: Skill[] = [
  { name: 'Strength', level: 1, color: '#ef4444' },
  { name: 'Agility', level: 1, color: '#22c55e' },
  { name: 'Endurance', level: 1, color: '#3b82f6' },
  { name: 'Speed', level: 1, color: '#eab308' },
  { name: 'Flexibility', level: 1, color: '#ec4899' },
  { name: 'Reactions', level: 1, color: '#8b5cf6' },
  { name: 'Brainpower', level: 1, color: '#14b8a6' },
];

export default function HomeScreen() {
  const [skills, setSkills] = useState<Skill[]>(defaultSkills);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserSkills() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not found');
        }

        const { data: userSkills, error: skillsError } = await supabase
          .from('user_skills')
          .select('*')
          .eq('user_id', user.id);

        if (skillsError) {
          throw skillsError;
        }

        if (userSkills && userSkills.length > 0) {
          const updatedSkills = defaultSkills.map(skill => {
            const userSkill = userSkills.find(us => us.skill_name === skill.name);
            return userSkill ? { ...skill, level: userSkill.level } : skill;
          });
          setSkills(updatedSkills);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load skills');
      } finally {
        setLoading(false);
      }
    }

    loadUserSkills();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1a1b1e', '#2d2e32']}
        style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Level {Math.floor(skills.reduce((acc, skill) => acc + skill.level, 0) / skills.length)} Fitness Warrior</Text>
      </LinearGradient>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.skillsContainer}>
        {skills.map((skill) => (
          <View key={skill.name} style={styles.skillCard}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { 
                    width: `${(skill.level / 99) * 100}%`,
                    backgroundColor: skill.color
                  }
                ]} 
              />
            </View>
            <Text style={styles.levelText}>Level {skill.level}</Text>
          </View>
        ))}
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Today's Stats</Text>
        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Steps</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Minutes Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0/5</Text>
            <Text style={styles.statLabel}>Quests Complete</Text>
          </View>
        </View>
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 18,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
  skillsContainer: {
    padding: 20,
  },
  skillCard: {
    backgroundColor: '#2d2e32',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  skillName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#3f3f46',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  levelText: {
    color: '#a1a1aa',
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#2d2e32',
    padding: 16,
    borderRadius: 12,
    width: '47%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#ef4444',
    borderRadius: 12,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});