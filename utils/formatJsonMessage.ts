type RawMQTTMessage = {
    event: string;
    timestamp: string;
    message: string; // this is a stringified object
  };
  
  type ParsedMQTTMessage = {
    event: string;
    timestamp: string;
    message: {
      event: string;
      payload: Record<string, any>;
    };
  };
  
  export function convertMessageToJSON(raw: RawMQTTMessage): ParsedMQTTMessage {
    try {
      return {
        event: raw.event,
        timestamp: raw.timestamp,
        message: JSON.parse(raw.message),
      };
    } catch (error) {
      console.error('JSON parsing error:', error);
      return {
        event: raw.event,
        timestamp: raw.timestamp,
        message: {
          event: 'error',
          payload: {
            error: 'Failed to parse message',
            raw: raw.message,
          },
        },
      };
    }
  }
  