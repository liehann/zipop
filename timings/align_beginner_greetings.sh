curl -X POST https://api.elevenlabs.io/v1/forced-alignment \                                                                                             ─╯
     -H "xi-api-key: ${cat from .env}" \
     -H "Content-Type: multipart/form-data" \
     -F file=@audio/beginner-greetings.mp3 \
     -F text="你好！你好吗？我很好，谢谢你。"