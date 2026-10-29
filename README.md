# xerflies-study
<img width="1024" height="256" alt="xerflies-example" src="https://github.com/user-attachments/assets/c1dd03e4-7287-4eee-9f48-67210174af04" />

### Concept Intro
The flutter of butterflies reminds me of the shallow breaths I was restricted to take when I had pnemonia. I wanted to create a hybrid
animal grouped not just on physical appearance, but also on behaviour. This project creates a combined dataset of xrays with white 
defining lines and black backgrounds, and butterflies with white backgrounds and black defining lines. I noticed these rivalled features
made more diverse images than some of my initial training iterations; the backgrounds, lines, and features were either a sharp black/white, or
a muddy neutral grey. 

### Strategies for training the models
To get a clear image from the conflicting data sets without maxing out my GPU allowance, I opted for a low-pixel, low number of images, 
high epoch amount. After trial and error I discovered this was the fastest way to get the clearest results. 

### Images Generation
The 50+ (56) images selected depict the denoising of each species, for each of the 8 butterflies we can see their development from 
ai pupa (random noise) to ai imago (fully clarified image), we can watch them grow! 

## Audio Generation
The strategy changes for each type of butterfly, divided into young and old. I used my knowledge of effects and values from live coding 
to design better audio generation prompts, and after some trial and error, I learned what the machine listens to. The prompts themselves
are in the sound-generation.ipynb file. 

## Quality Improvement Ideas 
Improvement depends largely on compute power & time available. With better resolution (from 32x32 pixels to 160x160). Further, sound could 
be improved with more parameters on the sound processing. 

## AI Assistance 
I used Gemini AI to fix the code, and as a summary when Googling solutions to issues my code was having, which was free. I also used Codex in VS Code to 
make the website itself, which was paid for in tokens. 
