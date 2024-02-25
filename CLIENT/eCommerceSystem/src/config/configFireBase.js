import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBFi7AkLRZUTLqduCpJLLnq2-8gmTOyUN4",
  authDomain: "ecommerce-21780.firebaseapp.com",
  projectId: "ecommerce-21780",
  storageBucket: "ecommerce-21780.appspot.com",
  messagingSenderId: "302979309042",
  appId: "1:302979309042:web:97471d49c2278d5eb11f6b",
  measurementId: "G-SHWSEDJW54",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
export { firebase };
export { firebaseConfig };
