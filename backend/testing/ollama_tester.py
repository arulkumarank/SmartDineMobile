import ollama

reply = ollama.chat(
  model='phi3:instruct',
  messages=[{'role':'user','content':'hello'}]
)

print(reply['message']['content'])
