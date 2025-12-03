"""
Script pour récupérer le lien iCal depuis l'intranet Epitech
Utilise Selenium pour gérer l'authentification Microsoft
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import time
import json

class EpitechICalFetcher:
    def __init__(self, headless=False):
        """
        Initialise le navigateur Chrome
        :param headless: Si True, le navigateur s'exécute en arrière-plan
        """
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # Spécifier le chemin de chromedriver
        service = Service('/usr/bin/chromedriver')
        
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.driver.maximize_window()
        self.wait = WebDriverWait(self.driver, 20)
    
    def login(self, email, password):
        """
        Se connecte à l'intranet Epitech via Microsoft
        :param email: Email Epitech (@epitech.eu)
        :param password: Mot de passe
        """
        print("🔐 Connexion à l'intranet Epitech...")
        
        # Accéder à la page de planning
        self.driver.get("https://intra.epitech.eu/planning/")
        time.sleep(2)
        
        try:
            # Attendre et cliquer sur le bouton de connexion Microsoft
            print("📧 Recherche du bouton de connexion Microsoft...")
            microsoft_btn = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Microsoft')] | //a[contains(@href, 'microsoft')] | //button[contains(@class, 'microsoft')]"))
            )
            microsoft_btn.click()
            print("✅ Bouton Microsoft cliqué")
            time.sleep(2)
            
            # Remplir l'email
            print("📝 Saisie de l'email...")
            email_field = self.wait.until(
                EC.presence_of_element_located((By.NAME, "loginfmt"))
            )
            email_field.send_keys(email)
            
            # Cliquer sur Suivant
            next_btn = self.driver.find_element(By.ID, "idSIButton9")
            next_btn.click()
            time.sleep(2)
            
            # Remplir le mot de passe
            print("🔑 Saisie du mot de passe...")
            password_field = self.wait.until(
                EC.presence_of_element_located((By.NAME, "passwd"))
            )
            password_field.send_keys(password)
            
            # Cliquer sur Se connecter
            signin_btn = self.driver.find_element(By.ID, "idSIButton9")
            signin_btn.click()
            time.sleep(2)
            
            # Gérer la page "Rester connecté ?"
            try:
                print("⏭️ Gestion de 'Rester connecté'...")
                stay_signed_in = self.wait.until(
                    EC.element_to_be_clickable((By.ID, "idSIButton9"))
                )
                stay_signed_in.click()
                time.sleep(3)
            except:
                print("⚠️ Pas de page 'Rester connecté' détectée")
            
            print("✅ Connexion réussie!")
            return True
            
        except Exception as e:
            print(f"❌ Erreur lors de la connexion: {e}")
            return False
    
    def get_ical_link(self):
        """
        Récupère le lien iCal depuis la page de planning
        :return: URL du fichier iCal ou None
        """
        print("\n🔍 Recherche du lien iCal...")
        
        try:
            # Retourner sur la page de planning
            self.driver.get("https://intra.epitech.eu/planning/")
            time.sleep(3)
            
            # Méthode spécifique: Chercher la balise <li class="lien ical">
            print("🔎 Recherche de la balise <li class='lien ical'>...")
            try:
                # Trouver l'élément li avec la classe "lien ical"
                li_element = self.wait.until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "li.lien.ical"))
                )
                print("✅ Balise <li class='lien ical'> trouvée!")
                
                # Chercher le lien <a> à l'intérieur
                ical_link_element = li_element.find_element(By.TAG_NAME, "a")
                ical_link = ical_link_element.get_attribute('href')
                
                if ical_link:
                    print(f"✅ Lien iCal trouvé: {ical_link}")
                    return ical_link
            except Exception as e:
                print(f"⚠️ Méthode principale échouée: {e}")
            
            # Méthode alternative 1: Chercher directement un lien contenant .ics
            print("🔎 Méthode alternative 1: Recherche d'un lien .ics...")
            try:
                ical_element = self.driver.find_element(
                    By.XPATH, 
                    "//a[contains(@href, '.ics')]"
                )
                ical_link = ical_element.get_attribute('href')
                if ical_link:
                    print(f"✅ Lien iCal trouvé: {ical_link}")
                    return ical_link
            except:
                print("⚠️ Méthode alternative 1 échouée")
            
            # Méthode alternative 2: Chercher dans un dropdown si nécessaire
            print("🔎 Méthode alternative 2: Recherche dans le dropdown...")
            try:
                # Chercher et cliquer sur le dropdown
                dropdown = self.driver.find_element(
                    By.XPATH,
                    "//button[contains(@class, 'dropdown')] | //div[contains(@class, 'dropdown')] | //*[contains(@class, 'dropdown-toggle')]"
                )
                dropdown.click()
                time.sleep(1)
                
                # Chercher le lien iCal dans le dropdown
                ical_link_element = self.wait.until(
                    EC.presence_of_element_located((By.XPATH, "//li[contains(@class, 'ical')]//a | //a[contains(@href, '.ics')]"))
                )
                ical_link = ical_link_element.get_attribute('href')
                print(f"✅ Lien iCal trouvé dans le dropdown: {ical_link}")
                return ical_link
            except Exception as e:
                print(f"⚠️ Méthode alternative 2 échouée: {e}")
            
            print("❌ Aucun lien iCal trouvé")
            print("\n💡 Astuce: Inspectez manuellement la page pour trouver le lien")
            print("   Le script va prendre une capture d'écran...")
            self.driver.save_screenshot("epitech_planning_page.png")
            print("   📸 Screenshot sauvegardé: epitech_planning_page.png")
            
            return None
            
        except Exception as e:
            print(f"❌ Erreur lors de la récupération du lien: {e}")
            return None
    
    def download_ical_content(self, ical_url):
        """
        Télécharge le contenu du fichier iCal
        :param ical_url: URL du fichier iCal
        :return: Contenu du fichier iCal
        """
        print(f"\n⬇️ Téléchargement du fichier iCal...")
        
        try:
            self.driver.get(ical_url)
            time.sleep(2)
            
            # Récupérer le contenu de la page
            ical_content = self.driver.find_element(By.TAG_NAME, "body").text
            
            print(f"✅ Fichier iCal téléchargé ({len(ical_content)} caractères)")
            return ical_content
            
        except Exception as e:
            print(f"❌ Erreur lors du téléchargement: {e}")
            return None
    
    def save_to_file(self, content, filename="epitech_planning.ics"):
        """
        Sauvegarde le contenu dans un fichier
        :param content: Contenu à sauvegarder
        :param filename: Nom du fichier
        """
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fichier sauvegardé: {filename}")
        except Exception as e:
            print(f"❌ Erreur lors de la sauvegarde: {e}")
    
    def close(self):
        """Ferme le navigateur"""
        self.driver.quit()


def main():
    """
    Fonction principale
    """
    print("=" * 50)
    print("🎓 EPITECH iCal FETCHER")
    print("=" * 50)
    
    # Demander les identifiants
    email = input("\n📧 Email Epitech: ")
    password = input("🔑 Mot de passe: ")
    
    # Créer l'instance du fetcher
    fetcher = EpitechICalFetcher(headless=False)  # headless=True pour mode invisible
    
    try:
        # Se connecter
        if fetcher.login(email, password):
            # Récupérer le lien iCal
            ical_link = fetcher.get_ical_link()
            
            if ical_link:
                print(f"\n🎉 Lien iCal trouvé!")
                print(f"📎 URL: {ical_link}")
                
                # Sauvegarder le lien dans un fichier
                with open("ical_link.txt", "w") as f:
                    f.write(ical_link)
                print("✅ Lien sauvegardé dans: ical_link.txt")
                
                # Demander si on veut télécharger le contenu
                download = input("\n⬇️ Voulez-vous télécharger le contenu du fichier iCal? (o/n): ")
                if download.lower() == 'o':
                    content = fetcher.download_ical_content(ical_link)
                    if content:
                        fetcher.save_to_file(content)
            else:
                print("\n❌ Impossible de trouver le lien iCal")
                print("💡 Vérifiez manuellement la page et regardez la capture d'écran")
    
    finally:
        # Garder le navigateur ouvert pour inspection manuelle
        input("\n⏸️ Appuyez sur Entrée pour fermer le navigateur...")
        fetcher.close()
        print("\n👋 Au revoir!")


if __name__ == "__main__":
    main()