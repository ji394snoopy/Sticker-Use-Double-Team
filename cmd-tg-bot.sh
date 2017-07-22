#!/bin/bash
# $1 = filename $2 = number
cd tg
sleep 5; bin/telegram-cli -k tg-server.pub -W -e 'msg Stickers /start'
sleep 5; bin/telegram-cli -k tg-server.pub -W -e 'msg Stickers /newpack'
sleep 5; bin/telegram-cli -k tg-server.pub -W -e 'msg Stickers sudt2'$1
i=0
while [ $i -le $2 ]
   do
       sleep 5; bin/telegram-cli -k tg-server.pub -W -e 'send_document Stickers ./../crawledFile/'$1'/resized/'$i'.png'
       sleep 5; bin/telegram-cli -k tg-server.pub -W -e 'msg Stickers 🇹🇼'
       ((i++))
   done
sleep 5; bin/telegram-cli -k tg-server.pub -W -e 'msg Stickers /publish'
sleep 5; bin/telegram-cli -k tg-server.pub -W -e 'msg Stickers sudt2'$1
sleep 5; bin/telegram-cli -k tg-server.pub -W -e 'quit'
cd ..
exit 1

