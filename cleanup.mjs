import { initializeApp } from 'firebase/app';
import { getDatabase, ref, remove, get } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDySPHRq53wDUSI8PKX4Jd-lRlvdRyTsoI",
    authDomain: "hack-ai-thon-reg.firebaseapp.com",
    databaseURL: "https://hack-ai-thon-reg-default-rtdb.firebaseio.com",
    projectId: "hack-ai-thon-reg",
    storageBucket: "hack-ai-thon-reg.firebasestorage.app",
    messagingSenderId: "115875849364",
    appId: "1:115875849364:web:64e726b1f5b290da22c081",
    measurementId: "G-1XBYKSP56K"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function cleanup() {
    const teamsRef = ref(db, "teams");
    const snapshot = await get(teamsRef);
    if (snapshot.exists()) {
        const updates = [];
        Object.entries(snapshot.val()).forEach(([key, val]) => {
            if (key.startsWith("LoadTest_Team_")) {
                updates.push(remove(ref(db, "teams/" + key)));
            }
        });
        await Promise.all(updates);
        console.log(`Removed ${updates.length} test teams.`);
    }
    process.exit(0); 98o
}
cleanup();
