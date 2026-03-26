FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["StudentManagement.API/StudentManagement.API.csproj", "StudentManagement.API/"]
COPY ["StudentManagement.Core/StudentManagement.Core.csproj", "StudentManagement.Core/"]
COPY ["StudentManagement.Infrastructure/StudentManagement.Infrastructure.csproj", "StudentManagement.Infrastructure/"]
COPY ["StudentManagement.Services/StudentManagement.Services.csproj", "StudentManagement.Services/"]
RUN dotnet restore "StudentManagement.API/StudentManagement.API.csproj"
COPY . .
WORKDIR "/src/StudentManagement.API"
RUN dotnet build "StudentManagement.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "StudentManagement.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "StudentManagement.API.dll"]
