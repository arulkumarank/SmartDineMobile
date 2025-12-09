import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#ff8a00', '#ff6b00', '#ff4500']} style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Icon name="food-fork-drink" size={120} color="#fff" />
        <Text style={styles.title}>SmartDine</Text>
        <Text style={styles.subtitle}>
          Discover personalized food recommendations powered by AI
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  loginText: {
    textAlign: 'center',
    color: '#ff6b00',
    fontSize: 18,
    fontWeight: '700',
  },
  signupButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  signupText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});