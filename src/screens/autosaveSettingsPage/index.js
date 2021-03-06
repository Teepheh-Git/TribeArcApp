// @flow
import React, {useContext, useEffect, useRef, useState} from 'react';
import {Image, StyleSheet, Switch, Text, TouchableOpacity, View} from "react-native";
import BackButton from "../../components/BackButton";
import {COLORS, icons, SIZES} from "../../constants";
import {Modalize} from "react-native-modalize";
import CustomButton from "../../components/CustomButton";
import {UserContext} from "../../context/UserContext";
import {handleQuery} from "../../graphql/requests";
import NotchResponsive from "../../components/NotchResponsive";
import {FONTS} from "../../constants/theme";
import moment from "moment";

const AutosaveSettingsPage = ({navigation}) => {

    const user = useContext(UserContext);


    const [isEnabled, setIsEnabled] = useState(false)
    const [savingsAcctId, setSavingsAcctId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [nextDate, setNextDate] = useState("")


    const toggleSwitch = () => setIsEnabled(previousState => !previousState);


    useEffect(() => {

        AutoSaveCheck()

    }, []);


    const AutoSaveCheck = async () => {


        let qry = `query {
                savingAccounts(where: { user_id: ${user.id} }) {
                    id
                        auto_charge
                        next_payment_date
                                }
                            }`


        try {


            const qryRes = await handleQuery(qry, user.token, false)
            // console.log(qryRes.data.savingAccounts[0].next_payment_date)
            await setIsEnabled(qryRes.data.savingAccounts[0].auto_charge)
            await setSavingsAcctId(qryRes.data.savingAccounts[0].id)
            await setNextDate(qryRes.data.savingAccounts[0].next_payment_date)


        } catch (e) {
            console.log(e, "AutoSaveChkErr")
        }


    }


    const AutoSaveToggle = async () => {


        let qry = `mutation {
                    updateSavingAccount(
                    input: { where: { id: ${savingsAcctId} }, data: { auto_charge: ${isEnabled} } }
                        ) {
                            savingAccount {
                            id
                                    }
                                }
                            }`


        try {
            setLoading(true)
            const qryRes = await handleQuery(qry, user.token, false)
            setLoading(false)
        } catch (e) {
            console.log(e, "AutoSaveErr")
            setLoading(false)

        }


    }


    const modalizeRef = useRef<Modalize>(null);

    const OpenModal = () => {
        modalizeRef.current?.open();
    };

    const CloseModal = () => {
        modalizeRef.current?.close();
    };


    const renderInner = () => (
        <View style={{
            backgroundColor: "#fff",
            paddingHorizontal: 20,
        }}>

            <Text style={styles.modalAutoCharge}>Auto Charge</Text>
            <Text style={styles.modalAutoChargeDesc}>You can turn ON or Off your Auto charge to your tribe arc account
                below</Text>

            <View style={styles.switchBox}>
                <Text style={{
                    fontSize: 14,
                    color: COLORS.black,
                    fontFamily: "Nexa-Book"
                }}>Turn {isEnabled ? "OFF" : "ON"} Auto Charge</Text>
                <Switch
                    trackColor={{false: "#767577", true: COLORS.secondary}}
                    thumbColor={isEnabled ? COLORS.primary : "#c3c1c4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                />
            </View>

            <CustomButton onPress={async () => {
                try {

                    await AutoSaveToggle()
                    CloseModal()

                } catch (e) {
                    console.log(e, "saveERR")
                }

            }} loading={loading} filled text={"Save"}/>


        </View>
    );

    const renderHeader = () => (
        <View style={{
            padding: 10,
            // backgroundColor: "#fff",
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
            // width: SIZES.width,

        }}>

            <TouchableOpacity onPress={() => CloseModal()}>
                <Text style={{
                    alignSelf: "flex-end",
                    color: "black",
                    fontFamily: "Nexa-Book",
                    fontSize: 28,
                    right: 15
                }}>x</Text>

            </TouchableOpacity>

        </View>
    );

    return (
        <>
            <NotchResponsive color={COLORS.white}/>
            <View style={styles.container}>


                <Modalize
                    modalHeight={SIZES.height * 0.5}
                    handleStyle={{backgroundColor: 'transparent'}}
                    childrenStyle={{backgroundColor: COLORS.white, borderRadius: 55,}}
                    ref={modalizeRef}>
                    {renderHeader()}
                    {renderInner()}
                </Modalize>


                <BackButton onPress={() => navigation.pop()}/>

                <Text style={styles.acctSettings}>Account Settings</Text>
                <Text style={styles.acctDesc}>Manage your savings account on tribe arc</Text>

                <TouchableOpacity onPress={OpenModal} activeOpacity={0.8} style={styles.box}>
                    <Image style={{width: 50, height: 50}} source={icons.onImage}/>
                    <View style={{justifyContent: "space-between", width: "70%"}}>
                        <Text style={styles.textAutocharge}>Turn {isEnabled ? "OFF" : "ON"} Auto charge</Text>
                        <Text style={styles.desc}>Next auto charge date is {moment(nextDate).format("DD MMMM, YYYY")}</Text>
                    </View>
                </TouchableOpacity>
            </View>

        </>
    );
};

export default AutosaveSettingsPage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingHorizontal: 20
    },
    acctSettings: {
        ...FONTS.h5,
        color: COLORS.primary,
        marginVertical: 20
    },
    acctDesc: {
        ...FONTS.body9,
        color: COLORS.black
    },
    box: {
        flexDirection: "row",
        marginTop: SIZES.font1 * 1.5,
        justifyContent: "space-evenly",
        height: 60

    },
    textAutocharge: {
        color: COLORS.black,
        fontSize: SIZES.width * 0.05,
        fontFamily: "Nexa-Book"

    },
    desc: {
        ...FONTS.body10,
        color: COLORS.black,
        letterSpacing: 0.2,
        opacity: 0.6
    },
    modalAutoCharge: {
        ...FONTS.h7,
        color: COLORS.black,
        marginVertical: 10
    },
    modalAutoChargeDesc: {
        ...FONTS.body9,
        color: COLORS.black,
        marginVertical: 10,
        opacity: 0.6,
        lineHeight: 24

    },
    switchBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        marginVertical: 20
    }


})
