import { auth } from "./auth";
import router from "./router";
import { httpAction } from "./_generated/server";
import { resend } from "./emails";

const http = router;

auth.addHttpRoutes(http);

// Add Resend webhook endpoint
http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    return await resend.handleResendEventWebhook(ctx, req);
  }),
});

export default http;