export const generateSHA256 = async (blob: Blob): Promise<string> => {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const generateLogFile = (
  filename: string,
  startTime: string,
  endTime: string,
  hash: string
): Blob => {
  const content = `RELATÓRIO DE INTEGRIDADE DIGITAL
--------------------------------
ARQUIVO: ${filename}
HASH SHA-256: ${hash}
--------------------------------
DATA INÍCIO: ${startTime}
DATA FIM:    ${endTime}
USER AGENT:  ${navigator.userAgent}
TIMESTAMP:   ${new Date().getTime()}
--------------------------------
Este arquivo garante que o vídeo original possui a assinatura digital acima.
Qualquer alteração no vídeo resultará em um hash diferente.
`;
  return new Blob([content], { type: 'text/plain' });
};