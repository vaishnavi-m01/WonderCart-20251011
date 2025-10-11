import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    // Share,
    ToastAndroid,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share';
import { TouchableWithoutFeedback } from 'react-native';




interface Product {
    name: string;
    description?: string;
    quantity: number;
    price: number;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    products: Product[];
    deliveryStatus: string;
    invoiceNo: string;
    date: string;
    user: {
        name: string;
        phone: string;
        email: string;
        // billingAddress: string;
        shippingAddress: string;
    };
}

const InvoiceModal: React.FC<Props> = ({
    visible,
    onClose,
    products,
    deliveryStatus,
    invoiceNo,
    date,
    user,
}) => {
    const [pdfPath, setPdfPath] = useState<string | null>(null);
    console.log("PdfPath", pdfPath)

    const subtotal = products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );


    const requestStoragePermission = async () => {
        if (Platform.OS === "android") {
            if (Platform.Version >= 33) {
                const res = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                );
                return res === PermissionsAndroid.RESULTS.GRANTED;
            } else if (Platform.Version >= 30) {

                try {
                    const granted = await PermissionsAndroid.request(
                        "android.permission.MANAGE_EXTERNAL_STORAGE" as any
                    );
                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                        return true;
                    } else {
                        ToastAndroid.show(
                            "Please allow 'All files access' in settings",
                            ToastAndroid.LONG
                        );
                        return false;
                    }
                } catch (err) {
                    console.warn(err);
                    return false;
                }
            } else {

                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
        }
        return true;
    };

    const downloadPDF = async () => {
        try {
            const subtotal = products.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; border: 2px solid black; margin: 20px; }
            h2, h3, h4 { text-align: center; margin-bottom: 10px; }
            .right { text-align: right; }
            .order-details { margin-bottom: 20px; border: 1px solid #000; padding: 10px; display: inline-block; float: right; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px 10px; text-align: center; }
            th { background-color: #f2f2f2; }
            .section { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h2>Invoice</h2>
          <div class="order-details">
            <p><strong>Order No:</strong> ${invoiceNo}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Status:</strong> ${deliveryStatus}</p>
          </div>
          <div style="clear: both;"></div>
          <div class="section">
            <p><strong>User Name:</strong> ${user.name}</p>
            <p><strong>Phone:</strong> ${user.phone}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Shipping Address:</strong> ${user.shippingAddress}</p>
          </div>
          <h4>Items</h4>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${products
                    .map(
                        (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price}</td>
                    <td>₹${item.price * item.quantity}</td>
                  </tr>`
                    )
                    .join('')}
            </tbody>
          </table>
          <div class="section right">
            <p><strong>Subtotal:</strong> ₹${subtotal}</p>
            <p><strong>Shipping:</strong> Free</p>
            <h3>Total: ₹${subtotal}</h3>
          </div>
        </body>
      </html>
    `;

            const fileName = `Invoice_${invoiceNo}_${user.name}.pdf`;

            const pdf = await RNHTMLtoPDF.convert({
                html,
                fileName: `Invoice_${invoiceNo}`,
                base64: false,
            });

            if (!pdf.filePath) {
                ToastAndroid.show('PDF file path not found', ToastAndroid.LONG);
                return;
            }

            const downloadsPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
            const documentsPath = `${RNFS.ExternalStorageDirectoryPath}/Documents/${fileName}`;

            const docsExists = await RNFS.exists(`${RNFS.ExternalStorageDirectoryPath}/Documents`);
            if (!docsExists) {
                await RNFS.mkdir(`${RNFS.ExternalStorageDirectoryPath}/Documents`);
            }

            await RNFS.copyFile(pdf.filePath, downloadsPath);
            await RNFS.copyFile(pdf.filePath, documentsPath);

            // Register with Download Manager
            RNFetchBlob.android.addCompleteDownload({
                title: fileName,
                description: 'Invoice PDF',
                mime: 'application/pdf',
                path: downloadsPath,
                showNotification: true,
            });

            ToastAndroid.show('PDF saved to Downloads & Documents', ToastAndroid.LONG);
            setPdfPath(downloadsPath);
            console.log('downloadPdf', downloadsPath);

            setTimeout(async () => {
                try {
                    await FileViewer.open(downloadsPath);
                } catch (err) {
                    console.error('Error opening PDF:', err);
                    ToastAndroid.show(
                        'Saved successfully but cannot open automatically',
                        ToastAndroid.LONG
                    );
                }
            }, 1000);
        } catch (error) {
            console.error('Error creating PDF:', error);
            ToastAndroid.show('Failed to create PDF', ToastAndroid.LONG);
        }
    };



    const sharePDF = async (invoiceNo: string, userName: string) => {

        const fileName = `Invoice_${invoiceNo}_${userName}.pdf`;
        const downloadsPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

        try {
            const exists = await RNFS.exists(downloadsPath);

            if (!exists) {
                ToastAndroid.show('Please download the PDF first', ToastAndroid.LONG);
                return;
            }

            await Share.open({
                title: 'Share Invoice',
                url: `file://${downloadsPath}`,
                type: 'application/pdf',
            });

        } catch (error) {
            console.error('Error sharing PDF:', error);
            ToastAndroid.show('Failed to share PDF', ToastAndroid.LONG);
        }
    };


    return (

        <Modal visible={visible} animationType="slide" transparent>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View style={styles.modal}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={onClose}>
                                    <Text style={styles.closeIcon}>✖</Text>
                                </TouchableOpacity>
                                <Text style={styles.headerTitle}>Invoice</Text>
                            </View>

                            <View style={styles.rightSide}>
                                <Text style={styles.label}>
                                    Order No: <Text style={styles.value}>{invoiceNo}</Text>
                                </Text>
                                <Text style={styles.label}>
                                    Date: <Text style={styles.value}>{date}</Text>
                                </Text>
                                <Text style={styles.label}>
                                    Due Date: <Text style={[styles.value, styles.paid]}>Paid</Text>
                                </Text>
                            </View>

                            <ScrollView style={styles.contentArea}>
                                <View style={styles.userDetails}>
                                    <Text style={styles.sectionHeader}>User Details</Text>
                                    <Text>Name: {user.name}</Text>
                                    <Text>Phone: {user.phone}</Text>
                                    <Text>Shipping Address: {user.shippingAddress}</Text>
                                </View>

                                <Text style={styles.sectionHeader}>Items</Text>
                                <View style={styles.tableHeader}>
                                    <Text style={styles.thDesc}>Description</Text>
                                    <Text style={styles.th}>Qty</Text>
                                    <Text style={styles.th}>Price</Text>
                                    <Text style={styles.th}>Total</Text>
                                </View>

                                {products.map((item, index) => (
                                    <View key={index} style={styles.tableRow}>
                                        <View style={styles.tdDesc}>
                                            <Text style={styles.bold}>{item.name}</Text>
                                            <Text style={styles.small}>{item.description}</Text>
                                        </View>
                                        <Text style={styles.td}>{item.quantity}</Text>
                                        <Text style={styles.td}>₹{item.price}</Text>
                                        <Text style={styles.td}>₹{item.quantity * item.price}</Text>
                                    </View>
                                ))}

                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Subtotal:</Text>
                                    <Text style={styles.totalAmount}>₹{subtotal}</Text>
                                </View>
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Shipping:</Text>
                                    <Text style={styles.totalAmount}>Free</Text>
                                </View>
                            </ScrollView>

                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.downloadBtn} onPress={downloadPDF}>
                                    <Text style={styles.actionText}>⬇️ Download PDF</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.shareBtn} onPress={() => sharePDF(invoiceNo, user.name)}>
                                    <Text style={styles.actionText}>📤 Share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>

    );
};

export default InvoiceModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#00000088',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modal: {
        width: '100%',
        maxHeight: '90%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
    },
    modalHeader: {
        backgroundColor: '#007bff',
        padding: 10,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeIcon: {
        fontSize: 18,
        color: '#fff',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    rightSide: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginTop: 10
    },

    label: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        marginBottom: 4,
    },

    value: {
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
    },

    paid: {
        color: 'green',
        fontWeight: 'bold',
    },

    orderNo: {
        fontWeight: 'bold',
    },
    date: {
        fontSize: 13,
    },
    due: {
        fontSize: 13,
    },
    paid: {
        color: 'green',
        fontWeight: 'bold',
    },
    contentArea: {
        marginTop: 10,
        maxHeight: 300,
    },
    userDetails: {
        marginBottom: 10,
    },
    sectionHeader: {
        fontWeight: 'bold',
        fontSize: 16,
        marginVertical: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        padding: 8,
        borderRadius: 6,
    },
    thDesc: {
        flex: 2,
        fontWeight: 'bold',
    },
    th: {
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderColor: '#ddd',
    },
    tdDesc: {
        flex: 2,
    },
    td: {
        flex: 1,
        textAlign: 'center',
        fontSize: 13,
    },
    bold: {
        fontWeight: '600',
    },
    small: {
        fontSize: 11,
        color: '#555',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    totalLabel: {
        fontWeight: 'bold',
    },
    totalAmount: {
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        marginTop: 16,
        justifyContent: 'space-between',
    },
    downloadBtn: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginRight: 8,
    },
    shareBtn: {
        backgroundColor: '#555',
        padding: 10,
        borderRadius: 8,
        flex: 1,
    },
    actionText: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#fff',
    },
});