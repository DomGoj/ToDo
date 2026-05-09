import {setGlobalOptions} from "firebase-functions/v2";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {onMessagePublished} from "firebase-functions/v2/pubsub";
import * as admin from "firebase-admin";
import {PubSub} from "@google-cloud/pubsub";

setGlobalOptions({region: "europe-central2"});

admin.initializeApp();

const TOPIC_NAME = "new-task-topic";

export const publishNewTaskEvent = onDocumentCreated(
  "tasks/{taskId}",
  async (event) => {
    const taskData = event.data?.data();
    const taskId = event.params.taskId;

    if (!taskData) return;

    const pubsub = new PubSub();
    const topic = pubsub.topic(TOPIC_NAME);

    const payload = {
      taskId: taskId,
      title: taskData.title,
      priority: taskData.priority || "Normalny",
      userEmail: taskData.createdByUserEmail,
    };

    const msgBuffer = Buffer.from(JSON.stringify(payload));
    await topic.publishMessage({data: msgBuffer});
    console.log(`[Pub/Sub] Sent task msg: ${taskData.title}`);
  }
);

export const processNewTask = onMessagePublished(
  TOPIC_NAME,
  async (event) => {
    const message = event.data.message;
    const base64Data = message.data || "{}";
    const dataStr = Buffer.from(base64Data, "base64").toString();
    const payload = JSON.parse(dataStr);

    console.log(`[Backend] Processing task: ${payload.title}`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const db = admin.firestore();

      await db.collection("notifications").add({
        title: "Nowe zadanie",
        taskTitle: payload.title,
        priority: payload.priority,
        taskId: payload.taskId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        dismissedBy: [],
      });

      console.log(`[Backend] Task processed: ${payload.title}`);
    } catch (error) {
      console.error("Processing error:", error);
    }
  }
);
