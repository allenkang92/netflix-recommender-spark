# 프로젝트 환경 설정

## 인스턴스 1: 데이터 처리 및 모델 학습

1. 기본 도구 및 라이브러리 설치:
```bash
sudo apt-get update
sudo apt-get install -y make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
```

2. pyenv 설치:
```bash
curl https://pyenv.run | bash
```

3. .bashrc 파일에 pyenv 설정 추가:
```bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc
```

4. Python 3.12.3 설치 및 가상환경 생성:
```bash
pyenv install 3.12.3
pyenv virtualenv 3.12.3 py3_12_3
pyenv activate py3_12_3
```

5. 필요한 Python 패키지 설치:
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary pandas scikit-learn pyspark
```

6. Java 설치:
```bash
sudo apt install openjdk-17-jre-headless
```

7. JAVA_HOME 설정:
```bash
echo 'export JAVA_HOME=/usr/lib/jvm/java-1.17.0-openjdk-amd64' >> ~/.bashrc
source ~/.bashrc
```

8. 작업 디렉토리 생성:
```bash
mkdir -p ~/work/spark
```

## 인스턴스 2: FastAPI 백엔드 서버

1. 기본 도구 및 라이브러리 설치: (인스턴스 1과 동일)

2. pyenv 설치 및 설정: (인스턴스 1과 동일)

3. Python 3.12.3 설치 및 가상환경 생성: (인스턴스 1과 동일)

4. FastAPI 및 관련 패키지 설치:
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary
```

5. 작업 디렉토리 생성:
```bash
mkdir -p ~/fastapi_app
```

markdownCopy## 인스턴스 3: ELK 스택 (Elasticsearch, Logstash, Kibana)

1. 시스템 업데이트 및 기본 도구 설치:
```bash
sudo apt-get update
sudo apt-get install -y apt-transport-https

Java 설치:

bashCopysudo apt-get install -y openjdk-17-jre-headless

Elasticsearch GPG 키 및 소스 리스트 추가:

bashCopywget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
sudo apt-get update

Elasticsearch 설치:

bashCopysudo apt-get install elasticsearch

Elasticsearch 설정 및 시작:

bashCopysudo nano /etc/elasticsearch/elasticsearch.yml
sudo systemctl start elasticsearch
sudo systemctl enable elasticsearch

Logstash 설치:

bashCopysudo apt-get install logstash

Logstash 설정:

bashCopysudo nano /etc/logstash/logstash.yml

Logstash 파이프라인 설정 (예시):

bashCopysudo nano /etc/logstash/conf.d/logstash.conf

Logstash 시작 및 활성화:

bashCopysudo systemctl start logstash
sudo systemctl enable logstash

Kibana 설치:

bashCopysudo apt-get install kibana

Kibana 설정 및 시작:

bashCopysudo nano /etc/kibana/kibana.yml
sudo systemctl start kibana
sudo systemctl enable kibana

방화벽 설정 (필요한 경우):

bashCopysudo ufw allow 9200  # Elasticsearch
sudo ufw allow 5601  # Kibana
sudo ufw allow 5044  # Logstash Beats input

ELK 스택 상태 확인:

bashCopysudo systemctl status elasticsearch
sudo systemctl status logstash
sudo systemctl status kibana