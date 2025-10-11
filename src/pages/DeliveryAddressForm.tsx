import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Alert } from 'react-native';
import axios from 'axios';
import apiClient from '../services/apiBaseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/StackScreen';



type Country = {
  countryId: number;
  countryName: string;
  activeStatus: boolean;
};

type State = {
  stateId: number;
  stateName: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;
type DeliveryAddressFormRouteProp = RouteProp<RootStackParamList, 'DeliveryAddressForm'>;



const DeliveryAddressForm = () => {
  const [userId, setUserId] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setAddress] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [line2, setLandmark] = useState('');
  // const [state, setState] = useState('Tamil Nadu');
  const [city, setCity] = useState('');
  const [pinCode, setPincode] = useState('');
  const [modalVisibleState, setModalVisibleState] = useState(false);
  const [line1Error, setLine1Error] = useState('');
  const [cityError, setCityError] = useState('');
  const [pinCodeError, setPinCodeError] = useState('');
  const [stateError, setStateError] = useState('');
  const navigation = useNavigation<NavigationProp>();

  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedCountryName, setSelectedCountryName] = useState<string>('India');

  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedStateName, setSelectedStateName] = useState<string>('Tamil Nadu');
  const route = useRoute<DeliveryAddressFormRouteProp>();
  const editAddress = route.params?.editAddress;


   useEffect(() => {
    const timer = setTimeout(() => {
      if (city.trim().length >= 3) {
        fetchPincodeByCity(city.trim());
      }
    }, 800); 

    return () => clearTimeout(timer); 
  }, [city]);

  useEffect(() => {
    if (editAddress) {
      setAddress(editAddress.line1);
      setLandmark(editAddress.line2);
      setCity(editAddress.city);
      setPincode(editAddress.pinCode);
      setSelectedCountryId(editAddress.countryId);
      setSelectedStateId(editAddress.stateId);
    }
  }, [editAddress]);



  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          setUserId(user.userId);
          setName(user.name);
          setPhone(user.phone);
        }
      } catch (error) {
        console.error('Error loading user from AsyncStorage:', error);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (countries.length > 0) {
      setSelectedCountryId(countries[0].countryId);
      setSelectedCountryName(countries[0].countryName);
    }
  }, [countries]);


  useEffect(() => {
    if (states.length > 0) {
      setSelectedStateId(states[0].stateId);
      setSelectedStateName(states[0].stateName);
    }
  }, [states]);

  const selectCountry = (id: number, name: string) => {
    setSelectedCountryId(id);
    setSelectedCountryName(name);
    setModalVisible(false);
  };


  const selectState = (id: number, name: string) => {
    setSelectedStateId(id);
    setSelectedStateName(name);
    setModalVisibleState(false);
  }

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await apiClient.get('v1/country');
      console.log('API Response:', response.data);
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await apiClient.get('v1/states');
      console.log('StateApi response', response.data);
      setStates(response.data);
    } catch (error) {
      console.log('Error fetching states:', error)
    } finally {
      setLoading(false);
    }
  }

  const handleClick = async () => {
    let hasError = false;

    if (!selectedStateId) {
      Alert.alert('Error', 'Please select a state');
      hasError = true;
    }

    if (!line1.trim()) {
      setLine1Error('Address Line 1 is required');
      hasError = true;
    } else {
      setLine1Error('');
    }

    if (!city.trim()) {
      setCityError('City is required');
      hasError = true;
    } else {
      setCityError('');
    }

    if (!pinCode.trim()) {
      setPinCodeError('Pin Code is required');
      hasError = true;
    } else {
      setPinCodeError('');
    }

    if (hasError) {
      return;
    }

    try {

      const userString = await AsyncStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : {};

      const userPayload = {
        userId,
        name,
        phone,
        email: user.email || "",
        password: user.password || "",
        roleId: user.roleId || 2
      };

      await apiClient.put(`v1/user/${userId}`, userPayload);
      await AsyncStorage.setItem('user', JSON.stringify(userPayload));
      if (editAddress && editAddress.addressId) {

        await apiClient.put(`v1/address/${editAddress.addressId}`, {
          addressId: editAddress.addressId,
          userId,
          countryId: selectedCountryId,
          stateId: selectedStateId,
          type: 'SHIPPING',
          line1,
          line2,
          city,
          town: null,
          pinCode
        });
        Alert.alert('Success', 'Address updated successfully!');
      } else {

        const response = await apiClient.post('v1/address', {
          userId,
          type: 'SHIPPING',
          line1,
          line2,
          city,
          pinCode,
          countryId: selectedCountryId,
          stateId: selectedStateId
        });
        await AsyncStorage.setItem('selectedAddress', JSON.stringify({
          ...response.data,
          name: name,
          phone: phone,
          countryName: selectedCountryName,
          stateName: selectedStateName
        }));

        console.log("response", response)
        Alert.alert('Success', 'Address saved successfully!');
      }

      navigation.navigate("DeliveryAddress", { refresh: true });

    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address.');
    }
  };


  

  const fetchPincodeByCity = async (cityName: string) => {
    try {
      const res = await axios.get(`https://api.postalpincode.in/postoffice/${cityName}`);
      const data = res.data?.[0]?.PostOffice;

      if (data && data.length > 0) {
        const firstPin = data[0].Pincode;
        setPincode(firstPin); // auto-fill first pincode
      }
    } catch (error) {
      console.log('Error fetching pincode:', error);
    }
  };




  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" color="#0077CC" size={24} style={styles.icon}/>
        </TouchableOpacity>

        <Text style={styles.text}>{editAddress ? "Edit Address" : "Delivery Address"}</Text>

      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, paddingBottom: 30,marginRight:10,marginLeft:10 }}
      >

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <Text style={styles.label}>
            Country <Text style={styles.required}>*</Text>
          </Text>

          <TouchableOpacity
            style={styles.countryPicker}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.countryText}>
              {selectedCountryName ? selectedCountryName : 'Select country'}
            </Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <Text style={styles.label}>Full name  (First and Last name)</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Mobile number</Text>
          <TextInput
            style={styles.input}

            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>Flat, House no., Building, Company
            <Text style={styles.required}> *</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            value={line1}
            onChangeText={(text) => {
              setAddress(text);
              if (line1Error && text.trim()) {
                setLine1Error('');
              }
            }}
          />
          {line1Error ? (
            <Text style={styles.errorText}>{line1Error}</Text>
          ) : null}


          <Text style={styles.label}>Landmark</Text>
          <TextInput
            style={styles.input}
            placeholder='E.g. near apollo hospital'
            value={line2}
            onChangeText={setLandmark}
          />

          <View style={styles.rowContainer}>
            <Text style={styles.label}>Pincode
              <Text style={styles.required}> *</Text>
            </Text>
            <Text style={styles.city}>Town/City <Text style={styles.required}>*</Text></Text>
          </View>


          <View style={styles.rowContainer}>
            <TextInput
              style={styles.inputbox}
              value={pinCode}
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={(text) => {
                setPincode(text);
                if (pinCodeError && text.trim()) setPinCodeError('');
              }}
            />
            <TextInput
              style={styles.inputbox}
              value={city}
              onChangeText={(text) => {
                setCity(text);
                if (cityError && text.trim()) setCityError('');
              }}
            />
          </View>


          <View style={styles.rowContainer}>
            <Text style={styles.errorText}>{pinCodeError ? pinCodeError : ' '}</Text>
            <Text style={styles.errorText}>{cityError ? cityError : ' '}</Text>
          </View>


          <Text style={styles.label}>State</Text>
          <TouchableOpacity
            style={styles.countryPicker}
            onPress={() => setModalVisibleState(true)}
          >
            <Text style={styles.countryText}>
              {selectedStateName ? selectedStateName : 'Select State'}
            </Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          {stateError ? <Text style={styles.errorText}>{stateError}</Text> : null}


          <TouchableOpacity style={styles.button} onPress={handleClick}>
            <Text style={styles.btnText}>Use this address</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>



      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent}>
            <View style={styles.row}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
              >
                <Entypo name="cross" color="#000" size={24} />
              </TouchableOpacity>

            </View>


            <FlatList
              data={countries}
              keyExtractor={(item) => item.countryId.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => selectCountry(item.countryId, item.countryName)}
                >
                  <Text style={styles.countryName}>{item.countryName}</Text>
                </TouchableOpacity>
              )}
            />

          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={modalVisibleState}
        transparent
        animationType='fade'>

        <Pressable style={styles.modalOverlay} onPress={() => setModalVisibleState(false)}>
          <Pressable style={styles.modalContent}>
            <View style={styles.row}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity
                onPress={() => setModalVisibleState(false)}
              >
                <Entypo name="cross" color="#000" size={24} />
              </TouchableOpacity>

            </View>


            <FlatList
              data={states}
              keyExtractor={(item) => item.stateId.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => selectState(item.stateId, item.stateName)}
                >
                  <Text style={styles.countryName}>{item.stateName}</Text>
                </TouchableOpacity>
              )}
            />

          </Pressable>
        </Pressable>

      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: 15,
    backgroundColor: '#fff',
    flex: 1,
  },
 header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        elevation: 5,
        paddingTop: 10,
        paddingBottom: 14,
        paddingHorizontal: 10,
    },

    text: {
        color: '#0077CC',
        fontSize: 20,
        marginLeft: 20,
        fontWeight: '900',
    },
    icon: {
        fontWeight: '900',
        marginLeft: 5
    },
  scrollView: {
    paddingBottom: 40
  },
  // title: {
  //   color: "#0077CC",
  //   fontSize: 20,
  //   marginLeft: 20,
  //   fontWeight: '900',
  //   marginBottom: 20,
  //   bottom: -9,
  //   textAlign: "center",
  //   paddingHorizontal: 30
  // },
  label: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },


  required: {
    color: "red",
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 5,
    fontSize: 16,
    color: "#303030"
  },
  inputbox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 5,
    fontSize: 16,
    width: "48%"
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'space-between',
    marginTop: 5,
  },
  countryText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',

  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#DBE2E9",
    padding: 10,

  },



  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
    paddingLeft: 12,

    margin: 0
  },
  countryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  countryName: {
    fontSize: 16,
    padding: 5,
    textAlign: 'left',
    paddingLeft: 18
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 2,
    marginVertical: 2,
  },
  city: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingRight: 75
  },
  button: {
    borderRadius: 15,
    margin: 5,
    padding: 10,
    backgroundColor: "#00A2F4",
    borderWidth: 1,
    borderColor: "#00A2F4",
    marginBottom: 20,
    marginTop: 20
  },
  btnText: {
    textAlign: "center",
    fontFamily: "League Spartan",
    fontWeight: 600,
    color: "#FFFFFF"
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    marginLeft: 4,
    fontSize: 14,
  },
  column: {
    flexDirection: "column"
  }
});

export default DeliveryAddressForm;
