                                **Notes**

github {
    
    Dateien auf github aktualisieren:
        git add .         ("." ALLE geänderten Dateien)
        git commit -m "Backup Aktualisisieren"

        git push origin main

        Wenn error dann:
            git pull origin main --rebase
        Nochmal:
            git push origin main

    Aktuelle commits löschen:
        git reset --soft HEAD~1

    Dateinamen sehen die committed wurden:
        git diff origin/main..main --name-only

}

FabsTracker/de {

    /home{

        1. Account Element(HTML) mit Bild(Standert "no Image" bild) und Dropdown(Einstellungen, Profil Settings, Logout)

    }

}


Lucidchart {
    Link: https://lucid.app/lucidchart/a6307b7b-4e47-43a3-9427-3b56813064e3/edit?invitationId=inv_c99a0f59-f483-450a-a47b-03174d6421c1
}


:CHATGPT:
Hallo ich programmiere gerade eine Gymapp(FabsTracker) mit html css und js(und Node.js + auch express Cookies(auch mit express-rate-limit) + auch mit bcrypt + HTTP-only Cookies(SameSite: 'lax', secure: true)) im Glassmorphism Style mit einer eigenen Domain(fabs-net.com, mit Cloudflare) über einen Raspberry pi 4 Model B Tunnel(und MySQL als Datenbank). Ich habe jetzt schon Anmelden(login), Registrieren(signup) und eine Homeseite(In der Navigationsleiste: Home, FoodTracker(disabled), Trainingsplan, Fortschritte(disabled), Griptrainer(disabled) und admin(nur wenn der User die role "admin" hat, wird im Backend geprüft)) die erkennt, ob man auf einem kleinem Bildschirm ist oder auf einem großem(Sidebar oder Bottom-nav).

FabsTracker Codes:
    Benutzer updaten: node FabsTracker/routes/utils/updateUser.js


MySQL:
    Backup Speichern: mysqldump -u root -p gymapp > backup/MySQL/backup.sql
    Backup Wiederherstellen: mysql -u root -p gymapp < backup/MySQL/backup.sql

NOCH MACHEN:
    Theme ändern über account img oben rechts