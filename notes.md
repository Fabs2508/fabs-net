                                **Notes**

github {
    
    Dateien auf github aktualisieren:
        git add .         ("." ALLE geänderten Dateien)
        git commit -m "test"

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

        1. Account Element(HTML) mit Bild(Anfangsbuchstabe vom User) und Dropdown(Einstellungen, Profil Settings, Logout)

    }

}


Lucidchart {
    Link: https://lucid.app/lucidchart/a6307b7b-4e47-43a3-9427-3b56813064e3/edit?invitationId=inv_c99a0f59-f483-450a-a47b-03174d6421c1
}


:CHATGPT:
Hallo ich programmiere gerade eine Gymapp(FabsTracker) mit html css und js(und Node.js + auch express Cookies) im Glassmorphism Style mit einer eigenen Domain(fabs-net.com, mit Cloudflare) über einen Raspberry pi 4 Model B Tunnel(und MySQL als Datenbank). Ich habe jetzt schon Anmelden(login), Registrieren(signup) und eine Startseite.

FabsTracker Codes:
    Benutzer updaten: node FabsTracker/routes/utils/updateUser.js


MySQL:
    Backup: mysqldump -u root -p gymapp > backup/MySQL/backup.sql

NOCH MACHEN:
    Backend, Route z.B. /home für das auslesen und umschreiben der "userInfo" Spalte.
    Und spalte "theme" in JS einbauen, ist bereits in MySQL.