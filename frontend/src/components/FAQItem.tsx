import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#001B74';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  category: string;
  question: string;
  answer: string;
  isOpen: boolean;
  onPress: () => void;
};

export default function FAQItem({
  category,
  question,
  answer,
  isOpen,
  onPress,
}: Props) {
  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onPress();
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        style={styles.header}
      >
        <View style={styles.iconBox}>
          <Ionicons name="help-circle-outline" size={22} color={PRIMARY} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.category}>{category}</Text>
          <Text style={styles.question}>{question}</Text>
        </View>

        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={PRIMARY}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.answerBox}>
          <Text style={styles.answer}>{answer}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5EAF5',
    shadowColor: '#001B74',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  category: {
    fontSize: 13,
    color: '#E11D48',
    fontWeight: '700',
    marginBottom: 4,
  },
  question: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
    lineHeight: 21,
  },
  answerBox: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
  },
  answer: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 23,
  },
});