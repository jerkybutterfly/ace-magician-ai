import { getSettings } from './settings';

const url = (p: string) => `${getSettings().agentUrl}${p}`;

export interface MqttConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  enabled: boolean;
  subscriptions: string[];
}

export interface MqttStatus {
  connected: boolean;
  enabled: boolean;
  last_error: string | null;
  subscriptions: string[];
  host: string;
  port: number;
}

export interface MqttMessage {
  topic: string;
  payload: string;
  ts: number;
  qos: number;
  retain: boolean;
}

export async function getMqttConfig(): Promise<MqttConfig> {
  const res = await fetch(url('/mqtt/config'));
  if (!res.ok) throw new Error('Failed to load MQTT config');
  return res.json();
}

export async function saveMqttConfig(cfg: Partial<MqttConfig>): Promise<MqttConfig> {
  const res = await fetch(url('/mqtt/config'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cfg),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getMqttStatus(): Promise<MqttStatus> {
  const res = await fetch(url('/mqtt/status'));
  if (!res.ok) throw new Error('Failed to load MQTT status');
  return res.json();
}

export async function mqttConnect(): Promise<MqttStatus> {
  const res = await fetch(url('/mqtt/connect'), { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function mqttDisconnect(): Promise<MqttStatus> {
  const res = await fetch(url('/mqtt/disconnect'), { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function mqttPublish(topic: string, payload: string, retain = false, qos = 0): Promise<void> {
  const res = await fetch(url('/mqtt/publish'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, payload, retain, qos }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function mqttSubscribe(topic: string): Promise<void> {
  const res = await fetch(url('/mqtt/subscribe'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function mqttUnsubscribe(topic: string): Promise<void> {
  const res = await fetch(url('/mqtt/subscribe'), {
    method: 'DELETE', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function getMqttMessages(since = 0): Promise<{ messages: MqttMessage[]; now: number }> {
  const res = await fetch(url(`/mqtt/messages?since=${since}`));
  if (!res.ok) throw new Error('Failed to load MQTT messages');
  return res.json();
}
