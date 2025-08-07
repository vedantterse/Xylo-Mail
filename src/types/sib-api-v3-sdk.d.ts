declare module 'sib-api-v3-sdk' {
  export class ApiClient {
    static instance: {
      authentications: {
        'api-key': {
          apiKey: string;
        };
      };
    };
  }

  export class SendSmtpEmail {
    sender?: {
      name: string;
      email: string;
    };
    to?: Array<{
      email: string;
      name?: string;
    }>;
    subject?: string;
    htmlContent?: string;
    textContent?: string;
    attachment?: Array<{
      name: string;
      content: string;
    }>;
  }

  export class TransactionalEmailsApi {
    sendTransacEmail(sendSmtpEmail: SendSmtpEmail): Promise<{
      messageId: string;
    }>;
  }
}
