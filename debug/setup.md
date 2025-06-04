## Start Containers

```bash
cd /mnt/c/data/repo/foreign/MMM-CalvinAndHobbes

docker run --rm -it -u root -v $(pwd)/debug:/opt/magic_mirror/config -v $(pwd):/opt/magic_mirror/modules/MMM-CalvinAndHobbes -p 8080:8080 --entrypoint bash karsten13/magicmirror:develop
```
