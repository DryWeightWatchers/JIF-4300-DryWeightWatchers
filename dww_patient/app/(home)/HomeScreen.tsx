import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
   
      <View style={styles.topSection}>
        <Text style={styles.userName}>John Doe</Text>
        <Text style={styles.subtitle}>You didn't record your weight today!</Text>
        <Text style={styles.additionalText}>
          Keeping track of your weight helps your doctor monitor changes in real-time.
        </Text>
      </View>

      {/* button container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate('EnterData')}
        >
          <Text style={styles.cardText}>Record Weight</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate('FAQ')}
        >
          <Text style={styles.cardText}>FAQ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.cardText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate('Setting')}
        >
          <Text style={styles.cardText}>Alerts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  topSection: {
    backgroundColor: '#0E315F',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 200, 
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'left',
    marginBottom: 10,
  },
  additionalText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginTop: -100, 
    paddingHorizontal: 10,
    paddingBottom: 30, 
  },
  cardButton: {
    backgroundColor: '#FFFFFF',
    width: '45%',
    height: 190, 
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  cardText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0E315F',
  },
});

export default HomeScreen;