# Netflix 콘텐츠 추천 시스템

## 프로젝트 개요
PySpark를 사용하여 Netflix 데이터셋 기반의 영화 추천 시스템을 구현을 목적으로 합니다.
FastAPI를 사용한 백엔드 API, 기본적 프론트엔드 인터페이스, EK를 활용한 모니터링 시스템이 포함되어 있습니다.

## 시스템 아키텍처
(시스템 아키텍처 다이어그램 또는 설명 추가)

## 주요 기능
- 사용자 장르 선호도 기반 영화 추천
- 장르 기반 필터링
- 실시간 데이터 처리 
- 추천 결과 시각화(for 데이터 분석)

## 기술 스택
- 백엔드: FastAPI, PySpark
- 프론트엔드: HTML, CSS, JavaScript
- 데이터베이스: PostgreSQL
- 데이터 처리: PySpark, Pandas
- 모니터링: Elasticsearch, Kibana

## 의존성


## 웹 프레임워크

-   fastapi==0.109.0
-   uvicorn==0.27.0

## 파이썬 라이브러리 & 프레임워크

-   pyspark==3.5.0
-   pandas==2.2.0
-   numpy==1.26.3
-   scikit-learn==1.4.0

## 카프카

-   kafka-python==2.0.2

## ELK

-   elasticsearch==7.17.9
-   elasticsearch-dsl==7.4.1

## DB

-   sqlalchemy==2.0.25
-   psycopg2-binary==2.9.9

## API Client

-   requests==2.31.0

## Async Support for FastAPI

-   aiohttp==3.9.1

## Jupyter Notebook

-   jupyter==1.0.0

## 이후 추가된 패키지

-   pyarrow==15.0.0 # PySpark 및 Pandas와 함께 사용하기 위해
-   python-dotenv==1.0.0 # 환경 변수 관리
-   pytest==7.4.4 # 테스트를 위해
-   black==23.12.1 # 코드 포맷팅
-   flake8==7.0.0 # 코드 린팅

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

## 인스턴스 3: EK 스택 (Elasticsearch, Kibana)

1. 시스템 업데이트 및 기본 도구 설치:

```bash
sudo apt-get update
sudo apt-get install -y apt-transport-https
```

2. Java 설치:

```bash
sudo apt-get install -y openjdk-17-jre-headless
```

3. Elasticsearch 설치:

```bash
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
sudo apt-get update
sudo apt-get install elasticsearch
```

4. Elasticsearch 설정 및 시작:

```bash
sudo nano /etc/elasticsearch/elasticsearch.yml
sudo systemctl start elasticsearch
sudo systemctl enable elasticsearch
```

5. Kibana 설치:

```bash
sudo apt-get install kibana
```

6. Kibana 설정 및 시작:

```bash
sudo nano /etc/kibana/kibana.yml
sudo systemctl start kibana
sudo systemctl enable kibana
```
