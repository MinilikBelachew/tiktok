import axios from "axios";
import crypto from "crypto";
import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
const config = {
    baseUrl: "https://196.188.120.3:38443/apiaccess/payment/gateway",
    fabricAppId: "c4182ef8-9249-458a-985e-06d191f4d505",
    appSecret: "fad0f06383c6297f545876694b974599",
    merchantAppId: "1476784246220805",
    merchantCode: "953984",
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC/ZcoOng1sJZ4CegopQVCw3HYqqVRLEudgT+dDpS8fRVy7zBgqZunju2VRCQuHeWs7yWgc9QGd4/8kRSLY+jlvKNeZ60yWcqEY+eKyQMmcjOz2Sn41fcVNgF+HV3DGiV4b23B6BCMjnpEFIb9d99/TsjsFSc7gCPgfl2yWDxE/Y1B2tVE6op2qd63YsMVFQGdre/CQYvFJENpQaBLMq4hHyBDgluUXlF0uA1X7UM0ZjbFC6ZIB/Hn1+pl5Ua8dKYrkVaecolmJT/s7c/+/1JeN+ja8luBoONsoODt2mTeVJHLF9Y3oh5rI+IY8HukIZJ1U6O7/JcjH3aRJTZagXUS9AgMBAAECggEBALBIBx8JcWFfEDZFwuAWeUQ7+VX3mVx/770kOuNx24HYt718D/HV0avfKETHqOfA7AQnz42EF1Yd7Rux1ZO0e3unSVRJhMO4linT1XjJ9ScMISAColWQHk3wY4va/FLPqG7N4L1w3BBtdjIc0A2zRGLNcFDBlxl/CVDHfcqD3CXdLukm/friX6TvnrbTyfAFicYgu0+UtDvfxTL3pRL3u3WTkDvnFK5YXhoazLctNOFrNiiIpCW6dJ7WRYRXuXhz7C0rENHyBtJ0zura1WD5oDbRZ8ON4v1KV4QofWiTFXJpbDgZdEeJJmFmt5HIi+Ny3P5n31WwZpRMHGeHrV23//0CgYEA+2/gYjYWOW3JgMDLX7r8fGPTo1ljkOUHuH98H/a/lE3wnnKKx+2ngRNZX4RfvNG4LLeWTz9plxR2RAqqOTbX8fj/NA/sS4mru9zvzMY1925FcX3WsWKBgKlLryl0vPScq4ejMLSCmypGz4VgLMYZqT4NYIkU2Lo1G1MiDoLy0CcCgYEAwt77exynUhM7AlyjhAA2wSINXLKsdFFF1u976x9kVhOfmbAutfMJPEQWb2WXaOJQMvMpgg2rU5aVsyEcuHsRH/2zatrxrGqLqgxaiqPz4ELINIh1iYK/hdRpr1vATHoebOv1wt8/9qxITNKtQTgQbqYci3KV1lPsOrBAB5S57nsCgYAvw+cagS/jpQmcngOEoh8I+mXgKEET64517DIGWHe4kr3dO+FFbc5eZPCbhqgxVJ3qUM4LK/7BJq/46RXBXLvVSfohR80Z5INtYuFjQ1xJLveeQcuhUxdK+95W3kdBBi8lHtVPkVsmYvekwK+ukcuaLSGZbzE4otcn47kajKHYDQKBgDbQyIbJ+ZsRw8CXVHu2H7DWJlIUBIS3s+CQ/xeVfgDkhjmSIKGX2to0AOeW+S9MseiTE/L8a1wY+MUppE2UeK26DLUbH24zjlPoI7PqCJjl0DFOzVlACSXZKV1lfsNEeriC61/EstZtgezyOkAlSCIH4fGr6tAeTU349Bnt0RtvAoGBAObgxjeH6JGpdLz1BbMj8xUHuYQkbxNeIPhH29CySn0vfhwg9VxAtIoOhvZeCfnsCRTj9OZjepCeUqDiDSoFznglrKhfeKUndHjvg+9kiae92iI6qJudPCHMNwP8wMSphkxUqnXFR3lr9A765GA980818UWZdrhrjLKtIIZdh+X1
-----END PRIVATE KEY-----`,
};
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certPath = path.join(__dirname, "..", "telebirr_cert_chain.pem");
const telebirrCert = fs.readFileSync(certPath);
const httpsAgent = new https.Agent({
    ca: telebirrCert,
    rejectUnauthorized: true,
});
// 🔹 Generate RSA signature (like sign-util-lib.js)
function generateSignature(payload, privateKey) {
    const signStr = Object.keys(payload)
        .sort()
        .map((k) => `${k}=${payload[k]}`)
        .join("&");
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(signStr);
    return sign.sign(privateKey, "base64");
}
// 🔹 Step 1: Get Fabric Token
async function getFabricToken() {
    const response = await axios.post(`${config.baseUrl}/getAccessToken`, {
        appId: config.fabricAppId,
        appSecret: config.appSecret,
    });
    return response.data.token; // adjust if response field differs
}
// 🔹 Step 2: Get Access Token
async function getAccessToken(fabricToken) {
    const response = await axios.post(`${config.baseUrl}/getAuthToken`, {
        appId: config.merchantAppId,
        requestId: Date.now().toString(),
    }, {
        headers: { Authorization: `Bearer ${fabricToken}` },
    });
    return response.data.token;
}
// 🔹 Step 3: Initiate Deposit
const initiateDeposit = async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        // 1. Get tokens
        const fabricToken = await getFabricToken();
        const accessToken = await getAccessToken(fabricToken);
        // 2. Build payload
        const payload = {
            appId: config.merchantAppId,
            nonce: Date.now().toString(),
            outTradeNo: orderId,
            receiveName: "YourCompany",
            returnUrl: "https://yourdomain.com/payment/success",
            notifyUrl: "https://yourdomain.com/payment/callback",
            shortCode: config.merchantCode,
            subject: "Wallet Deposit",
            timeoutExpress: "30m",
            timestamp: Date.now(),
            totalAmount: amount,
        };
        // 3. Sign payload
        const sign = generateSignature(payload, config.privateKey);
        // 4. Call Telebirr CreateOrder
        const response = await axios.post(`${config.baseUrl}/createOrder`, {
            ...payload,
            sign,
        }, {
            headers: { Authorization: `Bearer ${accessToken}` },
            httpsAgent,
        });
        return res.json(response.data);
    }
    catch (err) {
        console.error(err.response?.data || err.message);
        return res.status(500).json({ error: "Deposit initiation failed" });
    }
};
const requestWithdrawal = async (req, res) => {
    try {
        const { amount, phone, withdrawId } = req.body;
        const fabricToken = await getFabricToken();
        const accessToken = await getAccessToken(fabricToken);
        const payload = {
            appId: config.merchantAppId,
            merchantCode: config.merchantCode,
            nonce: Date.now().toString(),
            outTradeNo: withdrawId,
            payeeMsisdn: phone,
            payeeName: "Customer",
            remark: "Wallet Withdrawal",
            timestamp: Date.now(),
            totalAmount: amount,
        };
        const sign = generateSignature(payload, config.privateKey);
        const PAYOUT_URL = `${config.baseUrl}/merchantWithdraw/init`;
        const response = await axios.post(PAYOUT_URL, { ...payload, sign }, { headers: { Authorization: `Bearer ${accessToken}` }, httpsAgent });
        return res.json(response.data);
    }
    catch (err) {
        console.error(err.response?.data || err.message);
        return res.status(500).json({ error: "Withdrawal request failed" });
    }
};
export { requestWithdrawal, initiateDeposit };
