import os
from generate_static_html import image_to_html_text_portrait

def update_index():
    if not os.path.exists("portrait.jpg"):
        print("portrait.jpg not found!")
        return

    print("Generating text portrait...")
    portrait_html = image_to_html_text_portrait("portrait.jpg", width=120)
    
    with open('index.html', 'r') as f:
        content = f.read()
        
    # The tag we expect to replace
    target_img_tag = '<img id="final-portrait" src="portrait.jpg" alt="Beautiful Portrait">'
    
    if target_img_tag in content:
        print("Found target image tag. Replacing...")
        new_content = content.replace(target_img_tag, portrait_html)
        with open('index.html', 'w') as f:
            f.write(new_content)
        print("Successfully updated index.html with text portrait.")
    else:
        print("Could not find exact target image tag in index.html.")
        # fallback to regex if needed, but let's see if this works first
        # It should work because I verified the file content earlier

if __name__ == "__main__":
    update_index()
