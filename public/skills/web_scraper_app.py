
import requests
from bs4 import BeautifulSoup
import os

def scrape_website(url):
    """Scrapes the given URL and returns the page content."""
    print(f"Attempting to scrape: {url}")
    try:
        # Set a user-agent to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        
        # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract the visible text content
        content = soup.get_text(separator='\n')
        return content
    except requests.exceptions.RequestException as e:
        return f"Error during request: {e}"
    except Exception as e:
        return f"An unexpected error occurred: {e}"

def main():
    """Main function to handle user input and scraping."""
    print("--- Website Scraper Application ---")
    
    # In a real application, this would handle command-line arguments or a GUI.
    # For this execution, we will prompt the user for a URL.
    target_url = input("Enter the URL you want to scrape: ")
    
    if not target_url:
        print("No URL provided. Exiting.")
        return

    print("\nStarting scraping process...")
    
    scraped_data = scrape_website(target_url)
    
    print("\n--- SCRAPING RESULT ---")
    print(scraped_data)
    print("----------------------")

if __name__ == "__main__":
    main()
