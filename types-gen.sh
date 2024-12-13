#!/bin/bash
SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd $SCRIPTPATH

docker-compose exec app npx ts-node app/src/bin/types-gen.ts
sudo chown $(whoami) app/src/types/tables.ts
cat app/src/types/tables.ts | tr '\n' '\r' | sed -e 's/export enum Table {[^}]*}//g' |  tr '\r' '\n' > app/src/types/tables.ts.temp
mv -f app/src/types/tables.ts.temp app/src/types/tables.ts
