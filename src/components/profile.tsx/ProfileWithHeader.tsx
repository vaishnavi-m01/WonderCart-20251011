import React, { useRef, useState, useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import UnifiedHeader from "../common/UnifiedHeader";
import Profile from "../../tabs/Profile";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const ProfileWithHeader = ({ navigation }: any) => {
  const [isEditing, setEditing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const profileRef = useRef<any>(null);

  useFocusEffect(
    useCallback(() => {
      const checkLoginStatus = async () => {
        try {
          const userInfo = await AsyncStorage.getItem("user");
          setIsLoggedIn(!!userInfo);
        } catch (error) {
          console.log("Error checking login status:", error);
        }
      };
      checkLoginStatus();
    }, [])
  );

  const handleSave = async () => {
    if (profileRef.current) await profileRef.current.handleSaveProfile();
    setEditing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <UnifiedHeader
        title="My Account"
        showMenuButton={true}
        onMenuPress={() => navigation.openDrawer()}
        rightIcon={
          isLoggedIn
            ? !isEditing
              ? (
                <TouchableOpacity onPress={() => setEditing(true)}>
                  <MaterialIcons name="edit" size={22} color="#0094FF" />
                </TouchableOpacity>
              )
              : (
                <TouchableOpacity onPress={handleSave}>
                  <AntDesign name="check" size={24} color="#0094FF" />
                </TouchableOpacity>
              )
            : null
        }
      />
      <Profile ref={profileRef} isEditing={isEditing} />
    </View>
  );
};

export default ProfileWithHeader;
