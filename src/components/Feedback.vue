<script setup>
import { ref } from "vue";

const showFeedbackDialog = ref(false);
</script>

<template>
  <q-btn label="Feedback" @click="showFeedbackDialog = true" outline />
  <q-dialog v-model="showFeedbackDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">Give Feedback</div>
      </q-card-section>
      <q-card-section>
        <div>
          Please share your feedback to improve our browser. You can either:
          <ul>
            <li>
              Send your feedback by email to
              <a href="mailto:admin@ihr.live" target="_blank">admin@ihr.live</a
              >.
            </li>
            <li>
              Join our
              <a
                href="https://join.slack.com/t/internethealthreport/shared_invite/zt-19d4e48py-~oirVwkINe01gTVEF3o4Kw"
                >Slack workspace</a
              >
              and send your feedback as a direct message or in the #iyp-browser
              channel.
            </li>
            <li>
              Create a new
              <a
                href="https://github.com/InternetHealthReport/iyp-browser/issues"
                >GitHub issue</a
              >
              requesting a new feature.
            </li>
          </ul>
          Thank you!
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn v-close-popup label="Close" outline />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
