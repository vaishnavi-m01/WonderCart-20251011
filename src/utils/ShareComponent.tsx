import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Linking,
  TouchableWithoutFeedback,
  Image,
  ImageSourcePropType,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Foundation from "react-native-vector-icons/Foundation";
import Share from "react-native-share";
import Clipboard from "@react-native-clipboard/clipboard";
import RNFS from "react-native-fs";
import { JSX } from "react/jsx-runtime";

type Props = {
  productId: string | number;
  productName: string;
  description?: string;
  image: (string | number | { uri: string })[];
};


type ShareOption = {
  id: string;
  name: string;
  icon: JSX.Element;
  action: () => void;
};

const ShareComponent: React.FC<Props> = ({
  productId,
  productName,
  description,
  image,
}) => {
  const [visible, setVisible] = useState(false);
  console.log("share image:", image)
  let imageUrl: string | undefined;

  if (image?.length) {
    const firstImage = image[0];

    if (typeof firstImage === "number") {
      // Local require()
      imageUrl = Image.resolveAssetSource(firstImage).uri;
    } else if (typeof firstImage === "string") {
      // Remote URL
      imageUrl = firstImage;
    } else if (typeof firstImage === "object" && firstImage?.uri) {
      // Object format like { uri: "https://..." }
      imageUrl = firstImage.uri;
    }
  }

  console.log("resolved imageUrl:", imageUrl)

  if (!imageUrl) {
    imageUrl =
      "http://103.146.234.88:3011/api/public/v1/variant/imageUpload/serve/1_62c2d137-ba5d-4645-83c3-7ee23b16921f_shop1.png";
  }


  const appUrl = `myapp://product/${productId}`;
  const message = `🛍️ ${productName}\n\n${description}\n\nView this product in our app 👇\n${appUrl}`;

  const downloadImageToLocal = async (): Promise<string | null> => {
    try {
      const localPath = `${RNFS.CachesDirectoryPath}/shared_image.jpg`;
      const downloadResult = await RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: localPath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        return "file://" + localPath;
      }
      return null;
    } catch (error) {
      console.error("Image download error:", error);
      return null;
    }
  };

  const handleNativeShare = async () => {
    try {
      const localFile = await downloadImageToLocal();
      const shareUrl = localFile || imageUrl;

      await Share.open({
        title: productName,
        message,
        url: shareUrl,
      });
      setVisible(false);
    } catch (error) {
      console.error("Native Share Error:", error);
    }
  };

  const handleWhatsAppShare = async () => {
    try {
      const localFile = await downloadImageToLocal();
      const shareUrl = localFile || imageUrl;

      await Share.shareSingle({
        title: productName,
        message,
        url: shareUrl,
        social: Share.Social.WHATSAPP,
      });
      setVisible(false);
    } catch (error) {
      console.error("WhatsApp share error:", error);
    }
  };

  const handleTelegramShare = async () => {
    try {
      const localFile = await downloadImageToLocal();
      const shareUrl = localFile || imageUrl;

      await Share.shareSingle({
        title: productName,
        message,
        url: shareUrl,
        social: Share.Social.TELEGRAM,
      });
      setVisible(false);
    } catch (error) {
      console.error("Telegram share error:", error);
    }
  };

  const shareOptions: ShareOption[] = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: <FontAwesome name="whatsapp" size={30} color="#25D366" />,
      action: handleWhatsAppShare,
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: <FontAwesome name="telegram" size={30} color="#0088cc" />,
      action: handleTelegramShare,
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <FontAwesome name="facebook" size={30} color="#4267B2" />,
      action: () => {
        Linking.openURL(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            appUrl
          )}`
        );
        setVisible(false);
      },
    },
    {
      id: "messages",
      name: "Messages",
      icon: <MaterialIcons name="message" size={30} color="#34B7F1" />,
      action: () => {
        Linking.openURL(`sms:?body=${encodeURIComponent(message)}`);
        setVisible(false);
      },
    },
    {
      id: "email",
      name: "Email",
      icon: <MaterialIcons name="email" size={30} color="#D44638" />,
      action: () => {
        Linking.openURL(
          `mailto:?subject=${encodeURIComponent(
            productName
          )}&body=${encodeURIComponent(message)}`
        );
        setVisible(false);
      },
    },
    {
      id: "copy",
      name: "Copy",
      icon: <MaterialIcons name="content-copy" size={30} color="#333" />,
      action: () => {
        Clipboard.setString(`${message}\n${imageUrl}`);
        setVisible(false);
      },
    },
    {
      id: "more",
      name: "More",
      icon: <AntDesign name="ellipsis1" size={30} color="#333" />,
      action: handleNativeShare,
    },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <AntDesign name="sharealt" size={24} color="#212121" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <View style={styles.row}>
                <Text style={styles.headerText}>
                  Share this product with friends
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setVisible(false)}
                >
                  <Ionicons name="close" size={30} color="#555555" />
                </TouchableOpacity>
              </View>

              {/*  Product preview */}
              <View style={styles.productContainer}>
                <View style={styles.ImageContainer}>
                  <Image source={{ uri: imageUrl }} style={styles.Image} />
                </View>
                <View style={styles.iconContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Foundation key={i} name="star" color="#FFBB0C" size={16} />
                  ))}
                  <Text style={styles.rating}>5.0</Text>
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.label}>
                    {productName}, {description}
                  </Text>
                </View>
              </View>

              {/*  Sharing options */}
              <FlatList
                data={shareOptions}
                keyExtractor={(item) => item.id}
                numColumns={4}
                contentContainerStyle={styles.gridContainer}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={item.action}
                  >
                    {item.icon}
                    <Text style={styles.optionText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default ShareComponent;

const styles = StyleSheet.create({
  container: { padding: 10 },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000077",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    paddingLeft: 18,
  },
  gridContainer: { alignItems: "center", paddingBottom: 10 },
  optionItem: { alignItems: "center", margin: 15, width: 60 },
  optionText: { marginTop: 5, fontSize: 12, textAlign: "center" },
  row: { flexDirection: "row" },
  closeButton: {
    position: "absolute",
    top: -9,
    right: 20,
    padding: 5,
    borderRadius: 20,
  },
  productContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    margin: 5,
    marginLeft: 12,
    marginRight: 12,
  },
  Image: { height: 160, width: "93%", borderRadius: 8 },
  ImageContainer: { alignItems: "center", paddingTop: 5 },
  iconContainer: {
    flexDirection: "row",
    gap: 5,
    paddingLeft: 15,
    paddingTop: 7,
    marginBottom: 10,
  },
  rating: { fontSize: 10, fontWeight: "bold", bottom: -2, paddingLeft: 3 },
  productDetails: {
    backgroundColor: "#C5C6C7",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  label: {
    color: "#616569",
    fontWeight: "600",
    lineHeight: 25,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 5,
    paddingBottom: 5,
    justifyContent: "center",
  },
});
