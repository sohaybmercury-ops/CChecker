import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Settings, Key, Shield, Calculator, Plus, Trash2, Edit } from "lucide-react";

interface AppInfo {
  appId: string;
  environment: string;
  domain: string;
  version: string;
  features: Record<string, boolean>;
}

interface ApiKey {
  id: string;
  keyName: string;
  keyType: string;
  description: string | null;
  isActive: boolean | null;
  expiresAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface Secret {
  id: string;
  namespace: string;
  key: string;
  valueType: string;
  metadata: any;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export default function KeyManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newApiKey, setNewApiKey] = useState({
    keyName: "",
    keyType: "api_key",
    encryptedValue: "",
    description: ""
  });

  const [newSecret, setNewSecret] = useState({
    namespace: "app",
    key: "",
    value: "",
    valueType: "string",
    metadata: ""
  });

  // Queries
  const { data: appInfo } = useQuery({
    queryKey: ['/api/app/info'],
    queryFn: () => fetch('/api/app/info').then(res => res.json()) as Promise<AppInfo>
  });

  const { data: apiKeys = [] } = useQuery({
    queryKey: ['/api/keys'],
    queryFn: () => fetch('/api/keys').then(res => res.json()) as Promise<ApiKey[]>
  });

  const { data: appSecrets = [] } = useQuery({
    queryKey: ['/api/secrets', 'app'],
    queryFn: () => fetch('/api/secrets/app').then(res => res.json()) as Promise<Secret[]>
  });

  // Mutations
  const createApiKeyMutation = useMutation({
    mutationFn: async (data: typeof newApiKey) => {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create API key');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
      setNewApiKey({ keyName: "", keyType: "api_key", encryptedValue: "", description: "" });
      toast({ title: "API Key created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create API key", variant: "destructive" });
    }
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/keys/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete API key');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
      toast({ title: "API Key deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete API key", variant: "destructive" });
    }
  });

  const createSecretMutation = useMutation({
    mutationFn: async (data: typeof newSecret) => {
      const response = await fetch('/api/secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create secret');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/secrets', 'app'] });
      setNewSecret({ namespace: "app", key: "", value: "", valueType: "string", metadata: "" });
      toast({ title: "Secret created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create secret", variant: "destructive" });
    }
  });

  const deleteSecretMutation = useMutation({
    mutationFn: async ({ namespace, key }: { namespace: string; key: string }) => {
      const response = await fetch(`/api/secrets/${namespace}/${key}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete secret');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/secrets', 'app'] });
      toast({ title: "Secret deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete secret", variant: "destructive" });
    }
  });

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKey.keyName || !newApiKey.encryptedValue) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    createApiKeyMutation.mutate(newApiKey);
  };

  const handleCreateSecret = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecret.key || !newSecret.value) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    
    const secretData = {
      ...newSecret,
      metadata: newSecret.metadata ? JSON.parse(newSecret.metadata) : null
    };
    createSecretMutation.mutate(secretData);
  };

  return (
    <div className="bg-background text-foreground min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <Calculator className="h-4 w-4" />
              Calculator
            </Link>
            <span className="text-muted-foreground">/</span>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <h1 className="text-2xl font-bold">Key Management</h1>
            </div>
          </div>
          
          {appInfo && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" data-testid="badge-app-id">
                App ID: {appInfo.appId}
              </Badge>
              <Badge variant="outline" data-testid="badge-environment">
                {appInfo.environment}
              </Badge>
            </div>
          )}
        </div>

        {/* App Info Card */}
        {appInfo && (
          <Card className="mb-6" data-testid="card-app-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Application Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">App ID</Label>
                  <p className="font-mono text-xs break-all" data-testid="text-app-id">{appInfo.appId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Environment</Label>
                  <p data-testid="text-environment">{appInfo.environment}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Domain</Label>
                  <p className="font-mono text-xs" data-testid="text-domain">{appInfo.domain}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Version</Label>
                  <p data-testid="text-version">{appInfo.version}</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <Label className="text-muted-foreground">Features</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(appInfo.features).map(([feature, enabled]) => (
                    <Badge key={feature} variant={enabled ? "default" : "secondary"} data-testid={`badge-feature-${feature}`}>
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Management Tabs */}
        <Tabs defaultValue="api-keys" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api-keys" data-testid="tab-api-keys">
              <Key className="h-4 w-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="secrets" data-testid="tab-secrets">
              <Shield className="h-4 w-4 mr-2" />
              Secrets
            </TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New API Key</CardTitle>
                <CardDescription>Add a new API key to your key store</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateApiKey} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="keyName">Key Name *</Label>
                      <Input
                        id="keyName"
                        value={newApiKey.keyName}
                        onChange={(e) => setNewApiKey(prev => ({ ...prev, keyName: e.target.value }))}
                        placeholder="e.g., openai_api_key"
                        data-testid="input-key-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="keyType">Key Type</Label>
                      <Select
                        value={newApiKey.keyType}
                        onValueChange={(value) => setNewApiKey(prev => ({ ...prev, keyType: value }))}
                      >
                        <SelectTrigger data-testid="select-key-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="api_key">API Key</SelectItem>
                          <SelectItem value="secret">Secret</SelectItem>
                          <SelectItem value="token">Token</SelectItem>
                          <SelectItem value="password">Password</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="keyValue">Key Value *</Label>
                    <Input
                      id="keyValue"
                      type="password"
                      value={newApiKey.encryptedValue}
                      onChange={(e) => setNewApiKey(prev => ({ ...prev, encryptedValue: e.target.value }))}
                      placeholder="Enter your API key value"
                      data-testid="input-key-value"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="keyDescription">Description</Label>
                    <Textarea
                      id="keyDescription"
                      value={newApiKey.description}
                      onChange={(e) => setNewApiKey(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description of what this key is used for"
                      data-testid="textarea-key-description"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={createApiKeyMutation.isPending}
                    data-testid="button-create-api-key"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {createApiKeyMutation.isPending ? "Creating..." : "Create API Key"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* API Keys List */}
            <Card>
              <CardHeader>
                <CardTitle>API Keys ({apiKeys.length})</CardTitle>
                <CardDescription>Manage your stored API keys</CardDescription>
              </CardHeader>
              <CardContent>
                {apiKeys.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8" data-testid="text-no-api-keys">
                    No API keys found. Create your first API key above.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`api-key-${key.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium" data-testid={`text-api-key-name-${key.id}`}>
                              {key.keyName}
                            </h3>
                            <Badge variant="outline" data-testid={`badge-api-key-type-${key.id}`}>
                              {key.keyType}
                            </Badge>
                            <Badge variant={key.isActive ? "default" : "secondary"} data-testid={`badge-api-key-status-${key.id}`}>
                              {key.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          {key.description && (
                            <p className="text-sm text-muted-foreground" data-testid={`text-api-key-description-${key.id}`}>
                              {key.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1" data-testid={`text-api-key-created-${key.id}`}>
                            Created: {key.createdAt ? new Date(key.createdAt).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteApiKeyMutation.mutate(key.id)}
                          disabled={deleteApiKeyMutation.isPending}
                          data-testid={`button-delete-api-key-${key.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Secrets Tab */}
          <TabsContent value="secrets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Secret</CardTitle>
                <CardDescription>Add a new secret to your key store</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSecret} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="namespace">Namespace</Label>
                      <Select
                        value={newSecret.namespace}
                        onValueChange={(value) => setNewSecret(prev => ({ ...prev, namespace: value }))}
                      >
                        <SelectTrigger data-testid="select-namespace">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="app">app</SelectItem>
                          <SelectItem value="user">user</SelectItem>
                          <SelectItem value="system">system</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="secretKey">Key *</Label>
                      <Input
                        id="secretKey"
                        value={newSecret.key}
                        onChange={(e) => setNewSecret(prev => ({ ...prev, key: e.target.value }))}
                        placeholder="e.g., database_url"
                        data-testid="input-secret-key"
                      />
                    </div>
                    <div>
                      <Label htmlFor="valueType">Value Type</Label>
                      <Select
                        value={newSecret.valueType}
                        onValueChange={(value) => setNewSecret(prev => ({ ...prev, valueType: value }))}
                      >
                        <SelectTrigger data-testid="select-value-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="secretValue">Value *</Label>
                    <Textarea
                      id="secretValue"
                      value={newSecret.value}
                      onChange={(e) => setNewSecret(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="Enter your secret value"
                      data-testid="textarea-secret-value"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="metadata">Metadata (JSON)</Label>
                    <Textarea
                      id="metadata"
                      value={newSecret.metadata}
                      onChange={(e) => setNewSecret(prev => ({ ...prev, metadata: e.target.value }))}
                      placeholder='{"description": "Database connection string"}'
                      data-testid="textarea-metadata"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={createSecretMutation.isPending}
                    data-testid="button-create-secret"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {createSecretMutation.isPending ? "Creating..." : "Create Secret"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Secrets List */}
            <Card>
              <CardHeader>
                <CardTitle>Secrets ({appSecrets.length})</CardTitle>
                <CardDescription>Manage your stored secrets</CardDescription>
              </CardHeader>
              <CardContent>
                {appSecrets.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8" data-testid="text-no-secrets">
                    No secrets found. Create your first secret above.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {appSecrets.map((secret) => (
                      <div
                        key={secret.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`secret-${secret.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium" data-testid={`text-secret-key-${secret.id}`}>
                              {secret.namespace}:{secret.key}
                            </h3>
                            <Badge variant="outline" data-testid={`badge-secret-type-${secret.id}`}>
                              {secret.valueType}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground" data-testid={`text-secret-created-${secret.id}`}>
                            Created: {secret.createdAt ? new Date(secret.createdAt).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteSecretMutation.mutate({ namespace: secret.namespace, key: secret.key })}
                          disabled={deleteSecretMutation.isPending}
                          data-testid={`button-delete-secret-${secret.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}