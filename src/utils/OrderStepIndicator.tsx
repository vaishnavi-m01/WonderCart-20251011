import { View, Text, StyleSheet } from 'react-native';

const steps = ['Address', 'CheckOut', 'Payment', 'Confirm'];

type Props = {
  currentStep: number;
};

const OrderStepIndicator = ({ currentStep }: Props) => {
  return (
    <View style={styles.container}>
      {steps.map((label, index) => {
        const step = index + 1;
        const isActive = currentStep === step;
        const isCompleted = currentStep > step;

        return (
          <View key={index} style={styles.stepWrapper}>
            <View
              style={[
                styles.circle,
                isActive && styles.activeCircle,
                isCompleted && styles.completedCircle,
              ]}
            >
              <Text style={[styles.circleText, (isActive || isCompleted) && styles.activeText]}>
                {step}
              </Text>
            </View>

            {index !== steps.length - 1 && (
              <View style={[
                styles.line,
                currentStep > step ? styles.completedLine : styles.incompleteLine,
                { position: 'absolute', top: 24, left: '78%', right: '-50%' }
              ]} />
            )}

            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default OrderStepIndicator;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
    padding: 10
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircle: {
    backgroundColor: '#0077CC',
  },
  completedCircle: {
    backgroundColor: '#4CAF50',
  },
  circleText: {
    color: '#555',
    fontWeight: 'bold',
  },
  activeText: {
    color: '#fff',
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    color: '#888',
  },
  activeLabel: {
    color: '#000',
    fontWeight: '600',
  },
  line: {
    height: 2,
    // marginTop: -1,
    borderRadius: 1,     
    width: 60,            
    marginHorizontal: 8,   
  },

  completedLine: {
    backgroundColor: '#4CAF50',
  },
  incompleteLine: {
    backgroundColor: '#ddd',
  },
});
