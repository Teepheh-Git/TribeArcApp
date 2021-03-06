// @flow
import React, {useContext, useEffect, useState} from 'react';
import {Alert, Image, Linking, Modal, Pressable, StatusBar, StyleSheet, Text, TextInput, View} from "react-native";
import BackButton from "../../components/BackButton";
import {COLORS, icons, SIZES} from "../../constants";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import CustomButton from "../../components/CustomButton";
import {UserContext} from "../../context/UserContext";
import SelectDropdown from 'react-native-select-dropdown'
import axios from "axios";
import {BASE_URL} from "../../config";
import NotchResponsive from "../../components/NotchResponsive";
import {FONTS} from "../../constants/theme";


const AddBvn = ({navigation}) => {

    const user = useContext(UserContext)
    // console.log(user)

    const [modalVisible, setModalVisible] = useState(false);


    const [bvn, setBvn] = useState("")
    const [acctNumber, setAcctNumber] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [savingId, setSavingId] = useState(null)
    const [banks, setBanks] = useState([])
    const [bankCode, setBankCode] = useState("")
    const [error, setError] = useState(false)


    useEffect(() => {


        // BvnIdCheck()
        BVNTransaction()

    }, [])


    // const BvnIdCheck = async () => {
    //
    //     let bvnQry = `query {
    //                     users(where: { id: ${user.id} }) {
    //                     saving_account {
    //                     id
    //                                 }
    //                             }
    //                         }`
    //
    //
    //     try {
    //
    //         let res = await handleQuery(bvnQry, user.token, false)
    //         await res.data.users[0].saving_account.id
    //         await setSavingId(res.data.users[0].saving_account.id)
    //
    //
    //     } catch (e) {
    //         console.log(e, "BvnCheckIDError")
    //     }
    //
    // }


    // const AddBvn = async () => {
    //     setIsLoading(true)
    //
    //     let updateBvn = `mutation {
    //             updateSavingAccount(
    //             input: { where: { id: ${savingId} }, data: { bvn: "${bvn}", bvn_status: true } }
    //             ) {
    //                 savingAccount {
    //                 id
    //                 bvn
    //                 bvn_status
    //                 user_id {
    //                 id
    //                 }
    //                     }
    //                 }
    //             }`
    //
    //     try {
    //
    //         let bvnPost = await handleQuery(updateBvn, user.token, false)
    //         await setIsLoading(false)
    //         console.log(bvnPost.data.updateSavingAccount.savingAccount, "updateBVNNNN")
    //
    //
    //     } catch (e) {
    //         setIsLoading(false)
    //         console.log(e, "AddBvnError")
    //     }
    //
    // }


    const BVNTransaction = async () => {
        try {
            const bankCode = await axios.get(`https://api.tribearc.com/banks/get_banks`)
            // console.log(bankCode.data.data, "CODEEEE")

            await setBanks(bankCode.data.data)

        } catch (e) {
            console.log(e, "ERRor for code")

        }

    }


    const ValidateBVN = async () => {


        setIsLoading(true)


        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
        }

        await axios.post(`${BASE_URL}/verify/bvn`, {
            bvn: bvn,
            account_number: acctNumber,
            bank_code: bankCode
        }, {headers: headers}).then((response) => {
            console.log(response.data)
            setIsLoading(false)
            navigation.navigate("BottomTabs")

        })
            .catch((err) => {
                console.log(err.message, "Err")
                setIsLoading(false)
                {
                    err.message === "Request failed with status code 400" &&
                    setError(true)
                }

            })


    }


    return (
        <>


            <NotchResponsive color={COLORS.white}/>
            <View style={styles.container}>
                <BackButton onPress={() => navigation.pop()}/>
                <Text style={styles.addBVN}>Add BVN</Text>

                <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>

                    <View style={styles.addBVNContainer}>
                        <Image source={icons.addBvn} style={styles.image}/>
                        <Text style={styles.text}>Your BVN is safe with us</Text>
                        <Text style={styles.link} onPress={() => setModalVisible(true)}>Learn
                            more</Text>
                    </View>


                    <SelectDropdown
                        data={banks}
                        onSelect={(selectedItem, index) => {
                            console.log(selectedItem.code, index)
                            setBankCode(selectedItem.code)

                        }}
                        buttonTextAfterSelection={(selectedItem, index) => {
                            // text represented after item is selected
                            // if data array is an array of objects then return selectedItem.property to render after item is selected
                            return selectedItem.name
                        }}
                        rowTextForSelection={(item, index) => {
                            // text represented for each item in dropdown
                            // if data array is an array of objects then return item.property to represent item in dropdown
                            return item.name
                        }}
                        rowStyle={{width: "100%"}}
                        dropdownStyle={{width: "90%"}}
                        defaultButtonText={"Select Bank"}
                        buttonTextStyle={{
                            color: COLORS.black,
                            fontFamily: "Nexa-Book",
                            textAlign: "left",
                            fontSize: 15,
                            opacity: 0.7
                        }}
                        buttonStyle={{
                            width: "100%",
                            backgroundColor: COLORS.white,
                            borderWidth: 0.5,
                            borderColor: COLORS.secondary,
                            borderRadius: 5,
                            height: SIZES.width * 0.14,
                        }}
                    />


                    <TextInput
                        placeholder={"Enter Account Number"}
                        value={acctNumber}
                        placeholderTextColor={"#999999"}
                        onChangeText={value => {
                            setAcctNumber(value)
                            setError(false)
                        }}
                        style={styles.textInput}
                        keyboardType={"numeric"}
                        maxLength={10}
                    />

                    <TextInput
                        placeholder={"Enter BVN"}
                        value={bvn}
                        placeholderTextColor={"#999999"}
                        onChangeText={value => {
                            setBvn(value)
                            setError(false)

                        }}
                        style={styles.textInput}
                        keyboardType={"numeric"}
                        maxLength={13}
                    />

                    {error && <Text style={{color: "red", marginVertical: 10}}>Invalid Details</Text>}

                    <Text style={styles.dontKnow}>Don't know your BVN? <Text
                        onPress={() => Linking.openURL(`tel:*565*0%23`)}
                        style={styles.dial}> Dial *565*0#</Text></Text>

                </KeyboardAwareScrollView>


                <View style={{flex: 2, justifyContent: "flex-end"}}>
                    <CustomButton
                        onPress={async () => {
                            try {
                                // await AddBvn()
                                await ValidateBVN()

                            } catch (e) {
                                console.log(e, "error")
                            }
                        }}
                        loading={isLoading} filled
                        text={"Validate BVN"}/>
                </View>
            </View>


            <View style={styles.centeredView}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                        setModalVisible(!modalVisible);
                    }}>
                    <Pressable
                        onPress={() => setModalVisible(!modalVisible)}
                        style={styles.centeredView2}>
                        <View style={styles.modalView}>


                            <Text style={styles.learnMoreDesc}>
                                To better protect your identity as well as our ecosystem, TribeArc
                                will request various pieces of information to help verify your
                                identity. Your BVN helps us to keep you safe and fulfil our
                                regulatory requirements.
                                Please note that your BVN does NOT give us access to your bank details nor do we share
                                it with any third party. It is only used
                                for verification which makes it easy for you to deposit and withdraw your funds as well
                                as keep our platform safe from scammers.


                            </Text>


                        </View>
                    </Pressable>
                </Modal>
            </View>

        </>
    );
};

export default AddBvn


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20, height: SIZES.height, backgroundColor: COLORS.white

    }, addBVN: {
        color: COLORS.primary, fontFamily: "Nexa-Bold", fontSize: 30, marginVertical: 25
    }, addBVNContainer: {

        flexDirection: 'row',
        width: "100%",
        height: 60,
        borderWidth: 0.3,
        borderRadius: 5,
        borderColor: COLORS.secondary,
        alignItems: "center",
        paddingHorizontal: 20,
        marginVertical: 15,
        justifyContent: "space-between"
    },
    image: {
        width: 40, height: 40
    },
    text: {
        fontSize: 14,
        fontFamily: "Nexa-Book",
        color: COLORS.black, // backgroundColor:"cyan",
        width: '60%',
        paddingHorizontal: 10
    },
    link: {
        color: COLORS.secondary,
        fontFamily: "Nexa-Book",
        fontSize: 12
    },
    textInput: {
        borderColor: "#cbc8c8",
        borderWidth: 0.3,
        height: 55,
        borderRadius: 5,
        // marginVertical: 20,
        marginTop: 15,
        paddingHorizontal: 20,
        color: COLORS.black,
        fontFamily: "Nexa-Book",


    },
    dial: {
        color: COLORS.primary,
        fontFamily: "Nexa-Book",
        fontSize: 12,
    },
    dontKnow: {
        color: COLORS.black,
        fontFamily: "Nexa-Book",
        fontSize: 14,
        marginVertical: 20
    },
    centeredView: {
        // flex: 1,
        marginTop: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    centeredView2: {
        height: "100%",
        // marginTop: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#797676A3",
    },
    modalView: {
        margin: 10,
        width: "90%",
        height: SIZES.height * 0.5,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20, // alignItems: "center",
        shadowColor: "rgba(0,0,0,0.48)",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    cancelIcon: {
        width: SIZES.font1 * 2,
        height: SIZES.font1 * 2,
        alignSelf: "center",
        // marginTop:SIZES.font10
        // margin:10
    },
    learnMoreDesc: {
        ...FONTS.body8,
        color: COLORS.black,
        // opacity: 0.8,
        lineHeight: SIZES.font4,
        // marginVertical: SIZES.font4,
        width: "90%",
        // textAlign: "center",
        alignSelf: "center",
    },
})
